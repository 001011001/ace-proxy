import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string, phone?: string, displayName?: string) {
    const existing = await this.prisma.aceUser.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.aceUser.create({
      data: {
        email,
        password: passwordHash,
        phone: phone || null,
        displayName: displayName || null,
      },
    });

    const token = this.generateToken(user.id, user.email, user.role);
    return { user: { id: user.id, email: user.email, role: user.role, displayName: user.displayName }, ...token };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.aceUser.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException('This account uses social login. Please sign in with Google.');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.aceUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = this.generateToken(user.id, user.email, user.role);
    return { user: { id: user.id, email: user.email, role: user.role, level: user.level, displayName: user.displayName }, ...token };
  }

  /**
   * Google OAuth login / auto-register.
   * Verifies the Google ID token, then finds or creates a user.
   */
  async googleLogin(credential: string) {
    // Verify the Google ID token
    const payload = await this.verifyGoogleToken(credential);

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      throw new BadRequestException('Google account does not have an email');
    }

    // Check if this Google account is already linked
    const existingSocial = await this.prisma.aceSocialAccount.findUnique({
      where: { provider_providerId: { provider: 'GOOGLE', providerId: googleId } },
      include: { user: true },
    });

    if (existingSocial) {
      // Update avatar if changed
      await this.prisma.aceSocialAccount.update({
        where: { id: existingSocial.id },
        data: { avatar: picture || existingSocial.avatar },
      });
      await this.prisma.aceUser.update({
        where: { id: existingSocial.user.id },
        data: { lastLoginAt: new Date(), avatar: picture || existingSocial.user.avatar },
      });

      const token = this.generateToken(existingSocial.user.id, existingSocial.user.email, existingSocial.user.role);
      return {
        user: {
          id: existingSocial.user.id,
          email: existingSocial.user.email,
          role: existingSocial.user.role,
          level: existingSocial.user.level,
          displayName: existingSocial.user.displayName,
          avatar: picture || existingSocial.user.avatar,
        },
        ...token,
      };
    }

    // Check if email already exists (user registered with email before)
    const existingUser = await this.prisma.aceUser.findUnique({ where: { email } });

    let userId: string;

    if (existingUser) {
      // Link Google to existing account
      userId = existingUser.id;
      await this.prisma.aceSocialAccount.create({
        data: {
          userId: existingUser.id,
          provider: 'GOOGLE',
          providerId: googleId,
          email,
          name: name || null,
          avatar: picture || null,
        },
      });
      await this.prisma.aceUser.update({
        where: { id: existingUser.id },
        data: {
          lastLoginAt: new Date(),
          avatar: picture || existingUser.avatar,
          displayName: name || existingUser.displayName,
        },
      });
    } else {
      // Create new user
      const newUser = await this.prisma.aceUser.create({
        data: {
          email,
          displayName: name || null,
          avatar: picture || null,
        },
      });
      userId = newUser.id;
      await this.prisma.aceSocialAccount.create({
        data: {
          userId: newUser.id,
          provider: 'GOOGLE',
          providerId: googleId,
          email,
          name: name || null,
          avatar: picture || null,
        },
      });
    }

    const token = this.generateToken(userId, email, 'USER');
    return {
      user: {
        id: userId,
        email,
        role: 'USER',
        displayName: name || null,
        avatar: picture || null,
      },
      ...token,
    };
  }

  /**
   * Dev mode login — creates or retrieves a test user bypassing OAuth.
   * Only call after confirming NODE_ENV !== 'production'.
   */
  async devLogin(email: string, displayName?: string) {
    let user = await this.prisma.aceUser.findUnique({ where: { email } });
    if (!user) {
      const passwordHash = await bcrypt.hash('Test1234!', 10);
      user = await this.prisma.aceUser.create({
        data: { email, password: passwordHash, displayName: displayName || 'Test User' },
      });
    }
    await this.prisma.aceUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    const token = this.generateToken(user.id, user.email, user.role);
    return { user: { id: user.id, email: user.email, role: user.role, level: user.level, displayName: user.displayName }, ...token };
  }

  async getUser(id: string) {
    const user = await this.prisma.aceUser.findUnique({
      where: { id },
      select: {
        id: true, email: true, role: true, level: true, phone: true,
        displayName: true, avatar: true, totalSpend: true, credits: true,
        createdAt: true,
      },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  /**
   * Verify Google ID token via Google's tokeninfo endpoint.
   */
  private async verifyGoogleToken(idToken: string): Promise<{
    sub: string; email?: string; name?: string; picture?: string;
  }> {
    try {
      const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      if (!res.ok) {
        throw new BadRequestException('Invalid Google token');
      }
      const data = await res.json();
      // Verify audience (optional but recommended for production)
      // if (data.aud !== process.env.GOOGLE_CLIENT_ID) throw new BadRequestException('Invalid audience');
      return data;
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException('Failed to verify Google token');
    }
  }

  private generateToken(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    return {
      accessToken: this.jwtService.sign(payload),
      expiresIn: '7d',
    };
  }
}

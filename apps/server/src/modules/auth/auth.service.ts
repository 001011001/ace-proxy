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

  async register(email: string, password: string) {
    // Password strength validation
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      throw new BadRequestException('Password must be at least 8 characters with uppercase, lowercase, and number');
    }

    const existing = await this.prisma.aceUser.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.aceUser.create({
      data: { email, password: passwordHash },
    });

    const token = this.generateToken(user.id, user.email, user.role);
    return { user: { id: user.id, email: user.email, role: user.role }, ...token };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.aceUser.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user.id, user.email, user.role);
    return { user: { id: user.id, email: user.email, role: user.role, level: user.level }, ...token };
  }

  async getUser(id: string) {
    const user = await this.prisma.aceUser.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, level: true, totalSpend: true, credits: true, createdAt: true },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  private generateToken(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    return {
      accessToken: this.jwtService.sign(payload),
      expiresIn: '7d',
    };
  }
}

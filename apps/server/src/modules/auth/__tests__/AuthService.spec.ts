import { Test, TestingModule } from '@nestjs/testing';
import { Logger, UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

const mockUserCreate = jest.fn();
const mockUserFindUnique = jest.fn();

const mockPrisma = {
  aceUser: { create: mockUserCreate, findUnique: mockUserFindUnique, update: jest.fn() },
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('mock-jwt-token'), signAsync: jest.fn().mockResolvedValue('mock-jwt-token') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should create a new user successfully', async () => {
      mockUserFindUnique.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue({ id: 'u1', email: 'new@test.com' });
      const result = await service.register('new@test.com', 'SecureP1!');
      expect(result).toBeDefined();
      expect(result).toHaveProperty('accessToken');
    });

    it('should throw ConflictException on duplicate email', async () => {
      mockUserFindUnique.mockResolvedValue({ id: 'u_existing', email: 'dup@test.com' });
      await expect(service.register('dup@test.com', 'SecureP1!')).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return token for correct password', async () => {
      const hash = await bcrypt.hash('Correct1', 10);
      mockUserFindUnique.mockResolvedValue({ id: 'u1', email: 'u@t.com', password: hash, role: 'USER', status: 'ACTIVE' });
      const result = await service.login('u@t.com', 'Correct1');
      expect(result).toHaveProperty('accessToken');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hash = await bcrypt.hash('Correct1', 10);
      mockUserFindUnique.mockResolvedValue({ id: 'u1', email: 'u@t.com', password: hash, role: 'USER', status: 'ACTIVE' });
      await expect(service.login('u@t.com', 'Wrong1')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getUser', () => {
    it('should return user info', async () => {
      mockUserFindUnique.mockResolvedValue({ id: 'u1', email: 'u@t.com', name: 'Tester' });
      const result = await service.getUser('u1');
      expect(result).toBeDefined();
      expect(result.email).toBe('u@t.com');
    });
  });
});

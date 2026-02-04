import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';

// Mock Prisma
vi.mock('../config/database.js', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { prisma } from '../config/database.js';
import { AuthService } from '../services/auth.service.js';

describe('AuthService', () => {
  const authService = new AuthService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user successfully', async () => {
      const mockUser = {
        id: 'test-id',
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed-password',
        bio: null,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser',
        banner: null,
        location: null,
        website: null,
        streak: 0,
        lastPostDate: null,
        totalReactions: 0,
        soundEnabled: true,
        focusMode: false,
        theme: 'dark',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any);

      const result = await authService.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result.user.username).toBe('testuser');
      expect(result.token).toBeDefined();
    });

    it('should throw error if username already exists', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue({
        id: 'existing-id',
        username: 'testuser',
      } as any);

      await expect(
        authService.register({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        })
      ).rejects.toThrow('Username already taken');
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: 'test-id',
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await authService.login({
        username: 'testuser',
        password: 'password123',
      });

      expect(result.token).toBeDefined();
      expect(result.user.username).toBe('testuser');
    });

    it('should throw error with invalid credentials', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(
        authService.login({
          username: 'nonexistent',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });
});

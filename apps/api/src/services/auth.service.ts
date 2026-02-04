import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { ConflictError, UnauthorizedError } from '../utils/errors.js';
import type { RegisterInput, LoginInput } from '../validators/auth.validator.js';

export class AuthService {
  async register(input: RegisterInput) {
    const { username, email, password, name } = input;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictError('Username already taken');
      }
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        bio: true,
        avatar: true,
        banner: true,
        location: true,
        website: true,
        streak: true,
        lastPostDate: true,
        totalReactions: true,
        soundEnabled: true,
        focusMode: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate token
    const token = this.generateToken(user.id);

    return { user, token };
  }

  async login(input: LoginInput) {
    const { username, password } = input;

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user.id);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        bio: true,
        avatar: true,
        banner: true,
        location: true,
        website: true,
        streak: true,
        lastPostDate: true,
        totalReactions: true,
        soundEnabled: true,
        focusMode: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
        achievements: {
          include: { achievement: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return {
      ...user,
      achievements: user.achievements.map((ua) => ({
        ...ua.achievement,
        unlockedAt: ua.unlockedAt.toISOString(),
      })),
    };
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as string,
    } as jwt.SignOptions);
  }
}

export const authService = new AuthService();

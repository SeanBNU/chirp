import { beforeAll, afterAll, afterEach } from 'vitest';
import { prisma } from '../config/database.js';

beforeAll(async () => {
  // Setup test database
  process.env.DATABASE_URL = 'postgresql://chirp:chirp@localhost:5432/chirp_test';
});

afterEach(async () => {
  // Clean up after each test
  // This would clear tables in a real test environment
});

afterAll(async () => {
  await prisma.$disconnect();
});

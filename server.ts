import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express, { type Request, type Response, type NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';

interface StoredUser {
  id: string;
  email: string;
  fullName: string;
  role: 'student' | 'counselor';
  alias: string;
  aliasMode: boolean;
  department: string;
  yearLabel: string;
  studentId: string;
  specialization: string;
  salt: string;
  passwordHash: string;
  isDemo: boolean;
  createdAt: string;
}

interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  role: 'student' | 'counselor';
  alias: string;
  aliasMode: boolean;
  department: string;
  yearLabel: string;
  studentId: string;
  specialization: string;
  isDemo: boolean;
}

interface SessionPayload {
  sub: string;
  role: 'student' | 'counselor';
  jti: string;
  exp: number;
}

const PORT = Number(process.env.PORT) || 3000;
const SESSION_SECRET =
  process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16
    ? process.env.SESSION_SECRET
    : crypto.randomBytes(32).toString('hex');
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

const usersByEmail = new Map<string, StoredUser>();
const usersById = new Map<string, StoredUser>();
const revokedTokens = new Set<string>();

// Simple per-IP sliding window rate limiter for auth routes
const authAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX_REQUESTS = 30;

function rateLimitAuth(req: Request, res: Response, next: NextFunction): void {
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = authAttempts.get(key);
  if (!record || now > record.resetAt) {
    authAttempts.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    next();
    return;
  }
  record.count += 1;
  if (record.count > RATE_MAX_REQUESTS) {
    res.status(429).json({
      error: 'Too many authentication attempts. Please wait a minute and try again.',
    });
    return;
  }
  next();
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password: string, salt: string, storedHex: string): boolean {
  const derived = crypto.scryptSync(password, salt, 64);
  const storedBuf = Buffer.from(storedHex, 'hex');
  if (derived.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(derived, storedBuf);
}

function signSessionToken(user: StoredUser): string {
  const payload: SessionPayload = {
    sub: user.id,
    role: user.role,
    jti: crypto.randomUUID(),
    exp: Date.now() + SESSION_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

function verifySessionToken(token: string): SessionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');

  const sigBuf = Buffer.from(sig, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8')
    ) as SessionPayload;
    if (!parsed.sub || !parsed.exp || !parsed.jti) return null;
    if (Date.now() > parsed.exp) return null;
    if (revokedTokens.has(parsed.jti)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function toPublicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    alias: user.alias,
    aliasMode: user.aliasMode,
    department: user.department,
    yearLabel: user.yearLabel,
    studentId: user.studentId,
    specialization: user.specialization,
    isDemo: user.isDemo,
  };
}

function normalizeEmail(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim().toLowerCase() : '';
}

function cleanText(raw: unknown, maxLen: number): string {
  if (typeof raw !== 'string') return '';
  return raw.trim().slice(0, maxLen);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function seedDemoAccounts(): void {
  // Demo accounts are accessed exclusively via the explicit /api/auth/demo evaluator endpoint
  // (no guessable static password is accepted for demo login via /api/auth/signin).
  const demoStudent: StoredUser = {
    id: 'demo-student-alpha-8',
    email: 'aarav.mehta@campus.edu',
    fullName: 'Aarav Mehta',
    role: 'student',
    alias: 'User_Alpha_8',
    aliasMode: true,
    department: 'B.Tech Computer Science & Engineering',
    yearLabel: '3rd Year · Semester 6',
    studentId: 'CS23B041',
    specialization: '',
    salt: crypto.randomBytes(16).toString('hex'),
    passwordHash: '',
    isDemo: true,
    createdAt: new Date().toISOString(),
  };

  const demoCounselor: StoredUser = {
    id: 'demo-counselor-ananya',
    email: 'ananya.deshmukh@campus.edu',
    fullName: 'Dr. Ananya Deshmukh',
    role: 'counselor',
    alias: 'Counselor_Desk_01',
    aliasMode: false,
    department: 'Campus Psychological Services',
    yearLabel: 'Senior Clinical Psychologist',
    studentId: 'STAFF-PSY-01',
    specialization: 'Academic Stress & Anxiety',
    salt: crypto.randomBytes(16).toString('hex'),
    passwordHash: '',
    isDemo: true,
    createdAt: new Date().toISOString(),
  };

  usersByEmail.set(demoStudent.email, demoStudent);
  usersById.set(demoStudent.id, demoStudent);
  usersByEmail.set(demoCounselor.email, demoCounselor);
  usersById.set(demoCounselor.id, demoCounselor);
}

seedDemoAccounts();

function extractBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
}

async function startServer(): Promise<void> {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));

  // POST /api/auth/signup
  app.post('/api/auth/signup', rateLimitAuth, (req: Request, res: Response) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const email = normalizeEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';
    const fullName = cleanText(body.fullName, 80);
    const role = body.role === 'counselor' ? 'counselor' : 'student';
    const department =
      cleanText(body.department, 80) ||
      (role === 'counselor'
        ? 'Campus Psychological Services'
        : 'Undergraduate Studies');
    const yearLabel =
      cleanText(body.yearLabel, 50) ||
      (role === 'counselor' ? 'Licensed Campus Counselor' : '2nd Year · Semester 4');
    const studentId =
      cleanText(body.studentId, 30) ||
      (role === 'counselor'
        ? `STAFF-${Math.floor(100 + Math.random() * 900)}`
        : `STU-${Math.floor(1000 + Math.random() * 9000)}`);
    const specialization = cleanText(body.specialization, 80);
    const aliasInput = cleanText(body.alias, 28).replace(/[^a-zA-Z0-9_-]/g, '');
    const alias =
      aliasInput || `User_${Math.floor(100 + Math.random() * 899)}`;
    const aliasMode = role === 'student' ? body.aliasMode !== false : false;

    if (!fullName || fullName.length < 2) {
      res.status(400).json({ error: 'Please enter your full name (at least 2 characters).' });
      return;
    }
    if (!EMAIL_PATTERN.test(email) || email.length > 120) {
      res.status(400).json({ error: 'Please enter a valid university email address.' });
      return;
    }
    if (password.length < 8 || password.length > 128) {
      res
        .status(400)
        .json({ error: 'Password must be between 8 and 128 characters.' });
      return;
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      res.status(400).json({
        error: 'Password must include at least one letter and one number.',
      });
      return;
    }
    if (usersByEmail.has(email)) {
      res.status(409).json({
        error: 'An account with this email already exists. Please sign in instead.',
      });
      return;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);

    const newUser: StoredUser = {
      id: `usr-${crypto.randomUUID()}`,
      email,
      fullName,
      role,
      alias,
      aliasMode,
      department,
      yearLabel,
      studentId,
      specialization,
      salt,
      passwordHash,
      isDemo: false,
      createdAt: new Date().toISOString(),
    };

    usersByEmail.set(email, newUser);
    usersById.set(newUser.id, newUser);

    const token = signSessionToken(newUser);
    res.status(201).json({
      token,
      user: toPublicUser(newUser),
    });
  });

  // POST /api/auth/signin
  app.post('/api/auth/signin', rateLimitAuth, (req: Request, res: Response) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const email = normalizeEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';

    if (!EMAIL_PATTERN.test(email) || !password) {
      res.status(400).json({ error: 'Please enter both a valid email and password.' });
      return;
    }

    const user = usersByEmail.get(email);
    if (!user || !user.passwordHash) {
      res.status(401).json({
        error:
          'Invalid email or password. Use Quick Demo Access to preview demo accounts or create a new account.',
      });
      return;
    }

    const valid = verifyPassword(password, user.salt, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = signSessionToken(user);
    res.json({
      token,
      user: toPublicUser(user),
    });
  });

  // POST /api/auth/demo (one-click evaluator access for preloaded demo personas)
  app.post('/api/auth/demo', rateLimitAuth, (req: Request, res: Response) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const role = body.role === 'counselor' ? 'counselor' : 'student';
    const targetId =
      role === 'counselor' ? 'demo-counselor-ananya' : 'demo-student-alpha-8';
    const user = usersById.get(targetId);

    if (!user) {
      res.status(500).json({ error: 'Demo workspace unavailable.' });
      return;
    }

    const token = signSessionToken(user);
    res.json({
      token,
      user: toPublicUser(user),
    });
  });

  // GET /api/auth/me
  app.get('/api/auth/me', (req: Request, res: Response) => {
    const token = extractBearer(req);
    if (!token) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const payload = verifySessionToken(token);
    if (!payload) {
      res.status(401).json({ error: 'Session expired or invalid.' });
      return;
    }
    const user = usersById.get(payload.sub);
    if (!user) {
      res.status(401).json({ error: 'Account not found.' });
      return;
    }
    res.json({ user: toPublicUser(user) });
  });

  // POST /api/auth/signout
  app.post('/api/auth/signout', (req: Request, res: Response) => {
    const token = extractBearer(req);
    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        revokedTokens.add(payload.jti);
      }
    }
    res.json({ ok: true });
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Inner Balance server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Inner Balance server:', err);
  process.exit(1);
});

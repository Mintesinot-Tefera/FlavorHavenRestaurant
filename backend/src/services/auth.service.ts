import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { OAuth2Client } from "google-auth-library";
import { generateToken } from "../utils/jwt";
import { sendVerificationEmail } from "../utils/mailer";
import { env } from "../config/env";

const prisma = new PrismaClient();
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatarUrl: true,
  emailVerified: true,
  createdAt: true,
} as const;

export async function register(
  name: string,
  email: string,
  password: string
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw Object.assign(new Error("Email already registered"), { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = randomBytes(32).toString("hex");

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      emailVerified: false,
      verificationToken,
    },
    select: USER_SELECT,
  });

  await sendVerificationEmail(email, name, verificationToken);

  return user;
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  }

  if (!user.emailVerified) {
    throw Object.assign(
      new Error("Please verify your email before signing in"),
      { status: 403, code: "EMAIL_NOT_VERIFIED" }
    );
  }

  const token = generateToken(user.id);
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
    },
  };
}

export async function verifyEmail(token: string) {
  const user = await prisma.user.findUnique({
    where: { verificationToken: token },
  });

  if (!user) {
    throw Object.assign(new Error("Invalid or expired verification link"), {
      status: 400,
    });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verificationToken: null },
    select: USER_SELECT,
  });

  const jwt = generateToken(updated.id);
  return {
    token: jwt,
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      avatarUrl: updated.avatarUrl,
      emailVerified: updated.emailVerified,
    },
  };
}

export async function resendVerification(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal whether the email exists
    return;
  }
  if (user.emailVerified) {
    throw Object.assign(new Error("Email is already verified"), { status: 400 });
  }

  const verificationToken = randomBytes(32).toString("hex");
  await prisma.user.update({
    where: { id: user.id },
    data: { verificationToken },
  });

  await sendVerificationEmail(email, user.name, verificationToken);
}

export async function googleAuth(credential: string) {
  if (!env.GOOGLE_CLIENT_ID) {
    throw Object.assign(new Error("Google login is not configured"), {
      status: 503,
    });
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email || !payload.sub) {
    throw Object.assign(new Error("Invalid Google token"), { status: 400 });
  }

  const { sub: googleId, email, name = email, picture } = payload;

  // Find by googleId first, then by email (to link existing account)
  let user = await prisma.user.findUnique({ where: { googleId } });

  if (!user) {
    const byEmail = await prisma.user.findUnique({ where: { email } });
    if (byEmail) {
      // Link Google to existing email account
      user = await prisma.user.update({
        where: { id: byEmail.id },
        data: { googleId, emailVerified: true, avatarUrl: byEmail.avatarUrl ?? picture ?? null },
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          name,
          email,
          googleId,
          emailVerified: true,
          avatarUrl: picture ?? null,
        },
      });
    }
  }

  const token = generateToken(user.id);
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
    },
  };
}

export async function getProfile(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: USER_SELECT,
  });

  if (!user) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  return user;
}

export async function updateProfile(userId: number, name: string, email: string, avatarUrl?: string | null) {
  const existing = await prisma.user.findFirst({
    where: { email, NOT: { id: userId } },
  });
  if (existing) {
    throw Object.assign(new Error("Email already in use"), { status: 409 });
  }

  const data: any = { name, email };
  if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;

  return prisma.user.update({
    where: { id: userId },
    data,
    select: USER_SELECT,
  });
}

export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  if (!user.password) {
    throw Object.assign(
      new Error("This account uses Google sign-in and has no password"),
      { status: 400 }
    );
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    throw Object.assign(new Error("Current password is incorrect"), { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
}

export async function deleteAccount(userId: number) {
  await prisma.user.delete({ where: { id: userId } });
}


import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    res.status(403).json({ message: "Admin access required" });
    return;
  }

  next();
}

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { createHash, randomBytes } from "node:crypto";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async requestMagicLink(email: string): Promise<{ ok: true; debugMagicLink?: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {},
      create: { email: normalizedEmail, role: "streamer" }
    });

    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");

    await this.prisma.magicLinkToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      }
    });

    if (process.env.NODE_ENV !== "production") {
      return {
        ok: true,
        debugMagicLink: `${process.env.MAGIC_LINK_BASE_URL ?? "http://localhost:3000"}/auth/verify?email=${encodeURIComponent(
          normalizedEmail
        )}&token=${token}`
      };
    }

    return { ok: true };
  }

  async verifyMagicLink(email: string, token: string): Promise<{ accessToken: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      throw new UnauthorizedException("Invalid token");
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const magic = await this.prisma.magicLinkToken.findFirst({
      where: {
        userId: user.id,
        tokenHash,
        consumedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: "desc" }
    });

    if (!magic) {
      throw new UnauthorizedException("Invalid or expired token");
    }

    await this.prisma.$transaction([
      this.prisma.magicLinkToken.update({
        where: { id: magic.id },
        data: { consumedAt: new Date() }
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() }
      })
    ]);

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    return { accessToken };
  }

  async logout() {
    return { ok: true };
  }
}

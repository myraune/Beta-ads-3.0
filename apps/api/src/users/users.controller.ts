import { Controller, Get } from "@nestjs/common";
import { CurrentUser, type AuthUser } from "../common/current-user.decorator";
import { RequirePermission } from "../common/permissions.decorator";
import { PrismaService } from "../common/prisma.service";

@Controller()
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("me")
  @RequirePermission("users:read_me")
  async me(@CurrentUser() user: AuthUser) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        streamerProfile: {
          include: {
            channels: {
              include: {
                overlayCredential: {
                  select: {
                    keyPrefix: true,
                    rotatedAt: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return {
      id: dbUser?.id ?? user.id,
      email: dbUser?.email ?? user.email,
      role: dbUser?.role ?? user.role,
      emailVerifiedAt: dbUser?.emailVerifiedAt ?? null,
      streamerProfile: dbUser?.streamerProfile ?? null
    };
  }
}

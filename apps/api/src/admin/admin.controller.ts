import { Controller, Get, Query } from "@nestjs/common";
import { z } from "zod";
import { RequirePermission } from "../common/permissions.decorator";
import { PrismaService } from "../common/prisma.service";

const auditQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(200).default(50)
});

@Controller("admin")
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("audit")
  @RequirePermission("admin:audit")
  async audit(@Query() query: unknown) {
    const parsed = auditQuerySchema.parse(query ?? {});

    return this.prisma.auditLog.findMany({
      take: parsed.limit,
      orderBy: { createdAt: "desc" },
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });
  }
}

import { randomUUID } from "node:crypto";
import { BadRequestException, Controller, Get, Param, Post, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { z } from "zod";
import { RequirePermission } from "../common/permissions.decorator";
import { PrismaService } from "../common/prisma.service";
import { StorageService } from "./storage.service";

const creativeMetadataSchema = z.object({
  campaignId: z.string().uuid(),
  format: z.enum(["image", "gif", "mp4"]),
  durationSec: z.coerce.number().int().min(1).max(120),
  clickUrl: z.string().url(),
  fallbackUrl: z.string().url().optional(),
  approvalStatus: z.enum(["draft", "submitted", "approved", "rejected"]).default("submitted")
});

const creativeIdParamsSchema = z.object({
  id: z.string().uuid()
});

function extensionForMime(contentType: string): string {
  if (contentType === "image/png") return "png";
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/gif") return "gif";
  if (contentType === "video/mp4") return "mp4";
  return "bin";
}

async function streamToBuffer(stream: NodeJS.ReadableStream, maxBytes: number): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of stream) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > maxBytes) {
      throw new BadRequestException(`Creative exceeds ${Math.floor(maxBytes / 1024 / 1024)}MB limit`);
    }
    chunks.push(buffer);
  }

  return Buffer.concat(chunks);
}

function fieldValue(field: unknown): string | undefined {
  if (Array.isArray(field)) {
    const value = field.at(0);
    if (value && typeof value === "object" && "value" in value) {
      return String((value as { value: unknown }).value);
    }
    return undefined;
  }

  if (field && typeof field === "object" && "value" in field) {
    return String((field as { value: unknown }).value);
  }

  return undefined;
}

@Controller("creatives")
export class CreativesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService
  ) {}

  @Post()
  @RequirePermission("creatives:upload")
  async upload(@Req() req: FastifyRequest) {
    const multipartReq = req as FastifyRequest & {
      file: () => Promise<{
        filename: string;
        mimetype: string;
        file: NodeJS.ReadableStream;
        fields: Record<string, unknown>;
      }>;
    };

    const file = await multipartReq.file();
    if (!file) {
      throw new BadRequestException("Expected multipart file");
    }

    const metadata = creativeMetadataSchema.parse({
      campaignId: fieldValue(file.fields.campaignId),
      format: fieldValue(file.fields.format),
      durationSec: fieldValue(file.fields.durationSec),
      clickUrl: fieldValue(file.fields.clickUrl),
      fallbackUrl: fieldValue(file.fields.fallbackUrl),
      approvalStatus: fieldValue(file.fields.approvalStatus) ?? "submitted"
    });

    if (metadata.format === "mp4" && file.mimetype !== "video/mp4") {
      throw new BadRequestException("Expected video/mp4 for mp4 creative format");
    }

    if (metadata.format === "gif" && file.mimetype !== "image/gif") {
      throw new BadRequestException("Expected image/gif for gif creative format");
    }

    if (metadata.format === "image" && !["image/png", "image/jpeg", "image/webp"].includes(file.mimetype)) {
      throw new BadRequestException("Expected png, jpeg, or webp for image creative format");
    }

    const body = await streamToBuffer(file.file, 50 * 1024 * 1024);
    const objectKey = `creatives/${metadata.campaignId}/${randomUUID()}.${extensionForMime(file.mimetype)}`;

    const assetUrl = await this.storage.uploadObject({
      objectKey,
      body,
      contentType: file.mimetype
    });

    const creative = await this.prisma.creative.create({
      data: {
        campaignId: metadata.campaignId,
        format: metadata.format,
        durationSec: metadata.durationSec,
        clickUrl: metadata.clickUrl,
        fallbackUrl: metadata.fallbackUrl,
        objectKey,
        mimeType: file.mimetype,
        sizeBytes: body.length,
        approvalStatus: metadata.approvalStatus
      }
    });

    return {
      ...creative,
      assetUrl
    };
  }

  @Get(":id")
  @RequirePermission("creatives:read")
  async getById(@Param() params: unknown) {
    const parsed = creativeIdParamsSchema.parse(params);

    const creative = await this.prisma.creative.findUnique({
      where: { id: parsed.id },
      include: {
        campaign: {
          select: { id: true, name: true, advertiser: true }
        }
      }
    });

    if (!creative) {
      throw new BadRequestException("Creative not found");
    }

    return {
      ...creative,
      assetUrl: this.storage.objectUrl(creative.objectKey)
    };
  }
}

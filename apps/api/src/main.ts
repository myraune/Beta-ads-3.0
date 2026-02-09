import "reflect-metadata";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import { getEnv } from "./common/env";
import { PrismaService } from "./common/prisma.service";

async function bootstrap() {
  const env = getEnv();

  const adapter = new FastifyAdapter({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
      redact: {
        paths: ["req.headers.x-overlay-key", "req.headers.authorization"],
        remove: true
      }
    },
    disableRequestLogging: false,
    requestIdHeader: "x-request-id"
  });

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter);

  await app.register(cors, {
    origin: true,
    credentials: true
  });

  await app.register(helmet);

  await app.register(multipart, {
    attachFieldsToBody: false,
    limits: {
      fileSize: 50 * 1024 * 1024,
      files: 1,
      fieldSize: 16 * 1024
    }
  });

  await app.register(rateLimit, {
    max: 250,
    timeWindow: "1 minute"
  });

  app
    .getHttpAdapter()
    .getInstance()
    .addHook("onResponse", async (request, reply) => {
      reply.header("x-request-id", String(request.id));
    });

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  await app.listen({
    port: env.API_PORT,
    host: "0.0.0.0"
  });

  const logger = new Logger("Bootstrap");
  logger.log(`API listening on port ${env.API_PORT}`);
}

bootstrap();

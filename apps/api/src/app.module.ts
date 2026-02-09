import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "./auth/auth.module";
import { AdminController } from "./admin/admin.controller";
import { JwtAuthGuard } from "./common/jwt-auth.guard";
import { JwtStrategy } from "./common/jwt.strategy";
import { MetricsController } from "./common/metrics.controller";
import { MetricsService } from "./common/metrics.service";
import { PermissionGuard } from "./common/permissions.guard";
import { PrismaService } from "./common/prisma.service";
import { EventRateLimitService } from "./common/rate-limit.service";
import { RedisService } from "./common/redis.service";
import { CreativesController } from "./creatives/creatives.controller";
import { StorageService } from "./creatives/storage.service";
import { CampaignsController } from "./campaigns/campaigns.controller";
import { CampaignsService } from "./campaigns/campaigns.service";
import { DeliveriesController } from "./deliveries/deliveries.controller";
import { DeliveriesService } from "./deliveries/deliveries.service";
import { EventsController } from "./events/events.controller";
import { EventsService } from "./events/events.service";
import { OverlayController } from "./overlay/overlay.controller";
import { OverlayKeyService } from "./overlay/overlay-key.service";
import { OverlayGateway } from "./overlay/overlay.gateway";
import { DashboardGateway } from "./overlay/dashboard.gateway";
import { PayoutsController } from "./payouts/payouts.controller";
import { PayoutsService } from "./payouts/payouts.service";
import { ReportingController } from "./reporting/reporting.controller";
import { ReportingService } from "./reporting/reporting.service";
import { PdfReportService } from "./reporting/pdf.service";
import { StreamersController } from "./streamers/streamers.controller";
import { StreamersService } from "./streamers/streamers.service";
import { UsersController } from "./users/users.controller";

@Module({
  imports: [AuthModule],
  controllers: [
    MetricsController,
    UsersController,
    StreamersController,
    OverlayController,
    EventsController,
    CampaignsController,
    CreativesController,
    DeliveriesController,
    ReportingController,
    PayoutsController,
    AdminController
  ],
  providers: [
    PrismaService,
    RedisService,
    MetricsService,
    EventRateLimitService,
    StreamersService,
    OverlayKeyService,
    EventsService,
    CampaignsService,
    StorageService,
    DeliveriesService,
    ReportingService,
    PdfReportService,
    PayoutsService,
    OverlayGateway,
    DashboardGateway,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard
    }
  ]
})
export class AppModule {}

import { Controller, Get, Param, Res } from "@nestjs/common";
import type { FastifyReply } from "fastify";
import { z } from "zod";
import { RequirePermission } from "../common/permissions.decorator";
import { ReportingService } from "./reporting.service";

const paramsSchema = z.object({
  id: z.string().uuid()
});

@Controller("reports")
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get("campaign/:id/summary")
  @RequirePermission("reports:summary")
  async summary(@Param() params: unknown) {
    const parsed = paramsSchema.parse(params);
    return this.reportingService.campaignSummary(parsed.id);
  }

  @Get("campaign/:id/proof-timeline")
  @RequirePermission("reports:summary")
  async proofTimeline(@Param() params: unknown) {
    const parsed = paramsSchema.parse(params);
    return this.reportingService.proofTimeline(parsed.id);
  }

  @Get("campaign/:id/export.csv")
  @RequirePermission("reports:export_csv")
  async exportCsv(@Param() params: unknown, @Res({ passthrough: true }) res: FastifyReply) {
    const parsed = paramsSchema.parse(params);
    const csv = await this.reportingService.exportCsv(parsed.id);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.header("Content-Disposition", `attachment; filename=campaign-${parsed.id}-report.csv`);

    return csv;
  }

  @Get("campaign/:id/export.pdf")
  @RequirePermission("reports:export_pdf")
  async exportPdf(@Param() params: unknown, @Res({ passthrough: true }) res: FastifyReply) {
    const parsed = paramsSchema.parse(params);
    const pdf = await this.reportingService.exportPdf(parsed.id);

    res.header("Content-Type", "application/pdf");
    res.header("Content-Disposition", `attachment; filename=campaign-${parsed.id}-report.pdf`);

    return pdf;
  }
}

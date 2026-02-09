interface CapInput {
  hourlyDelivered: number;
  sessionDelivered: number;
  campaignHourlyCommands: number;
  capPerStreamerPerHour: number;
  capPerSession: number;
  pacingPerHour: number;
}

export function evaluateDeliveryCaps(input: CapInput): { allowed: boolean; reason?: string } {
  if (input.hourlyDelivered >= input.capPerStreamerPerHour) {
    return { allowed: false, reason: "streamer_hourly_cap_reached" };
  }

  if (input.sessionDelivered >= input.capPerSession) {
    return { allowed: false, reason: "session_cap_reached" };
  }

  if (input.campaignHourlyCommands >= input.pacingPerHour) {
    return { allowed: false, reason: "campaign_pacing_reached" };
  }

  return { allowed: true };
}

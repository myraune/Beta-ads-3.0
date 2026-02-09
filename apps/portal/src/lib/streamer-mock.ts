import type { CampaignWorkspaceData } from "@/types/streamer";

export const DEFAULT_STREAMER_WORKSPACE_DATA: CampaignWorkspaceData = {
  campaignId: "714",
  campaignTitle: "Project Pulse - Ultra Low-Latency SSD Launch",
  advertiser: "Nimbus Hardware",
  summary:
    "Nimbus Hardware is launching its new Pulse NVX SSD line and wants creators to highlight load-time improvements during real gameplay. Focus on smooth transitions, reduced wait times between matches, and practical setup tips your audience can use.",
  timeframe: {
    start: "2026-02-10",
    end: "2026-03-08"
  },
  revenue: {
    earned: "$0",
    perDisplay: "$2.35",
    potential: "$141"
  },
  adDisplays: {
    completed: 0,
    dailyLimit: 12,
    totalLimit: 60
  },
  brief: {
    headline: "Tips for talking points",
    talkingPoints: [
      "Mention that queue-to-match transitions feel faster with high random read speeds.",
      "Share one real moment where short loading kept the stream pace high.",
      "Explain that lower latency helps when switching between game scenes and creator tools.",
      "Remind viewers that this campaign focuses on in-game experience, not synthetic benchmarks."
    ],
    reminders: [
      "Keep brand mention natural and connected to what is happening live on stream.",
      "Show one gameplay segment where you call out the improvement.",
      "Use the provided campaign panel for the full campaign period."
    ]
  },
  requirements: {
    items: [
      {
        id: "req-1",
        title: "Requirement 1",
        description: "Call out Nimbus Pulse NVX by name at least once during active gameplay.",
        statusLabel: "under review"
      },
      {
        id: "req-2",
        title: "Requirement 2",
        description: "Pin the campaign panel link in your Twitch profile while the campaign is active.",
        statusLabel: "under review"
      },
      {
        id: "req-3",
        title: "Requirement 3",
        description: "Run at least one ad display test before going live for payout eligibility.",
        statusLabel: "under review"
      }
    ],
    banner: {
      title: "Panel banner",
      info: "Add this panel to your Twitch profile for the full campaign window.",
      cta: "Open panel asset",
      imageUrl:
        "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=760&q=80",
      imageAlt: "Campaign panel preview for Nimbus Pulse NVX",
      destinationUrl: "https://example.com/nimbus-pulse-launch"
    }
  },
  streamContent: {
    activationNotice: "Stream content can activate automatically after your overlay heartbeat is stable.",
    messageTitle: "Announcement",
    messageBody:
      "Drop-in line: Upgraded to Nimbus Pulse NVX this week and scene transitions feel instant. Check the campaign panel for the launch details.",
    commandTitle: "Chat command",
    commandBody:
      "!pulse -> Today I am testing the Nimbus Pulse NVX workflow setup. Full details in the panel link.",
    overlayPreviewTitle: "Overlay preview",
    overlayPreviewImageUrl:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=760&q=80",
    overlayPreviewImageAlt: "Neon gameplay setup preview",
    sampleTitle: "NVX launch moment"
  },
  configuration: {
    guidance: "Choose a primary overlay placement that stays clear of your gameplay HUD and facecam.",
    slots: [
      { id: 1, label: "Top left" },
      { id: 2, label: "Top center" },
      { id: 3, label: "Top right" },
      { id: 4, label: "Bottom left" },
      { id: 5, label: "Bottom center" },
      { id: 6, label: "Bottom right" }
    ]
  }
};

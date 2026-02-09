export type StreamerSection = "general" | "brief" | "requirements" | "stream-content" | "configuration";

export type WorkflowStepStatus = "pending" | "active" | "complete";

export type ConnectProvider = "twitch" | "youtube" | "kick";

export type SponsorshipTab = "my" | "available";

export interface StreamerFlowState {
  providerConnected: boolean;
  connectedProvider: ConnectProvider | null;
  setupCompleted: boolean;
  overlayConnected: boolean;
  joinedCampaignIds: string[];
  selectedCampaignId: string | null;
  lastTestRunAt: string | null;
}

export interface CampaignRequirement {
  id: string;
  title: string;
  description: string;
  statusLabel: string;
}

export interface SponsorshipCard {
  id: string;
  campaignId: string;
  campaignSlug: string;
  title: string;
  brand: string;
  description: string;
  status: "active" | "scheduled" | "finished";
  payoutLabel: string;
  imageUrl: string;
  imageAlt: string;
}

export interface SetupGuideTab {
  id: "drag-drop" | "video" | "text" | "mobile";
  label: string;
  title: string;
  intro: string;
  steps: string[];
  note?: string;
}

export interface StreamerShellNavItem {
  id: "sponsorships" | "clips" | "wallet" | "statistics" | "help";
  label: string;
  href?: string;
  comingSoon?: boolean;
}

export interface CampaignWorkspaceData {
  campaignId: string;
  campaignSlug: string;
  campaignTitle: string;
  isFeatured: boolean;
  requiresSetup: boolean;
  advertiser: string;
  summary: string;
  timeframe: {
    start: string;
    end: string;
  };
  revenue: {
    earned: string;
    perDisplay: string;
    potential: string;
  };
  adDisplays: {
    completed: number;
    dailyLimit: number;
    totalLimit: number;
  };
  brief: {
    headline: string;
    talkingPoints: string[];
    reminders: string[];
  };
  requirements: {
    items: CampaignRequirement[];
    banner: {
      title: string;
      info: string;
      cta: string;
      imageUrl: string;
      imageAlt: string;
      destinationUrl: string;
    };
  };
  streamContent: {
    activationNotice: string;
    messageTitle: string;
    messageBody: string;
    commandTitle: string;
    commandBody: string;
    overlayPreviewTitle: string;
    overlayPreviewImageUrl: string;
    overlayPreviewImageAlt: string;
    sampleTitle: string;
  };
  configuration: {
    guidance: string;
    slots: Array<{
      id: number;
      label: string;
    }>;
  };
}

export interface StreamerUiState {
  joined: boolean;
  overlayConnected: boolean;
  requirementsCompleted: boolean;
  completedRequirementIds: string[];
  liveMinutes: number;
  activeSection: StreamerSection;
  selectedOverlaySlot: number;
  generatedChatLink: string | null;
  isPaused: boolean;
}

export interface WorkflowStep {
  id: "join" | "go-live" | "requirements" | "review" | "paid";
  label: string;
  description?: string;
  status: WorkflowStepStatus;
}

export interface ProofTimelineEvent {
  id: string;
  ts: string;
  title: string;
  detail: string;
}

export interface StreamerWorkspaceProps {
  data?: CampaignWorkspaceData;
  campaignId?: string;
}

export interface StreamerLeftNavProps {
  campaignId: string;
  campaignTitle: string;
  activeSection: StreamerSection;
  onSelect: (section: StreamerSection) => void;
}

export interface StreamerRightRailProps {
  uiState: StreamerUiState;
  flowState?: StreamerFlowState;
  workflowSteps: WorkflowStep[];
  activityLog: ProofTimelineEvent[];
  onPrimaryAction: () => void;
  onSimulateLiveProgress: () => void;
  onToggleOverlay: () => void;
  onToggleRequirements: () => void;
}

export interface StreamerSectionsProps {
  data: CampaignWorkspaceData;
  uiState: StreamerUiState;
  setupCompleted: boolean;
  onToggleRequirementItem: (itemId: string) => void;
  onGenerateChatLink: (destinationUrl: string) => void;
  onToggleOverlay: () => void;
  onToggleRequirements: () => void;
  onSelectOverlaySlot: (slotId: number) => void;
}

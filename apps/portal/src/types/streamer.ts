export type StreamerSection = "general" | "brief" | "requirements" | "stream-content" | "configuration";

export type WorkflowStepStatus = "pending" | "active" | "complete";

export interface CampaignRequirement {
  id: string;
  title: string;
  description: string;
  statusLabel: string;
}

export interface CampaignWorkspaceData {
  campaignId: string;
  campaignTitle: string;
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
  activeSection: StreamerSection;
  selectedOverlaySlot: number;
  isPaused: boolean;
}

export interface WorkflowStep {
  id: "join" | "go-live" | "requirements" | "review" | "paid";
  label: string;
  description?: string;
  status: WorkflowStepStatus;
}

export interface StreamerWorkspaceProps {
  data?: CampaignWorkspaceData;
}

export interface StreamerLeftNavProps {
  campaignId: string;
  campaignTitle: string;
  activeSection: StreamerSection;
  onSelect: (section: StreamerSection) => void;
}

export interface StreamerRightRailProps {
  uiState: StreamerUiState;
  workflowSteps: WorkflowStep[];
  onPrimaryAction: () => void;
  onToggleOverlay: () => void;
  onToggleRequirements: () => void;
}

export interface StreamerSectionsProps {
  data: CampaignWorkspaceData;
  uiState: StreamerUiState;
  onToggleOverlay: () => void;
  onToggleRequirements: () => void;
  onSelectOverlaySlot: (slotId: number) => void;
}

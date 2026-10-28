export interface SLA {
  id: number;
  slaId: number;
  slaStatus: string;
  createdAt: number;
  updatedAt: number;
  slaDescription: string;
  slaName: string;
  slaFirstResponseTimeThreshold: number;
  slaNextResponseTimeThreshold: number;
  slaOnlyDuringBusinessHours: boolean;
  slaResolutionTimeThreshold: number;
  slaCompletedAt?: number | null;
  slaFrtDueAt?: number | null;
  slaNrtDueAt?: number | null;
  slaRtDueAt?: number | null;
}

export interface SLAStatus {
  type: string;
  threshold: string;
  icon: string;
  isSlaMissed: boolean;
}

export interface SLAEvent {
  id: number;
  meta: object;
  eventType: string;
  createdAt: number;
  updatedAt: number;
}

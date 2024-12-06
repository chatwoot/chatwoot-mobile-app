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

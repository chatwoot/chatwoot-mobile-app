export interface Account {
  active_at: string;
  auto_offline: boolean;
  availability: string;
  availability_status: string;
  custom_role?: string;
  custom_role_id?: string;
  id: number;
  name: string;
  permissions: string[];
  role: string;
  status: string;
}

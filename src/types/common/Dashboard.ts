export interface DashboardApp {
  id: number;
  title: string;
  content: Content[];
  createdAt: string;
}
interface Content {
  url: string;
  type: string;
}

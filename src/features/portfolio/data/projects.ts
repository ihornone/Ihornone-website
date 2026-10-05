export interface Project {
  id: string;
  title: string;
  category: string;
  icon: string;
  image: string;
  description: string;
  pinned?: boolean | number;
  order?: number;
  statusBadge?: string;
  meta?: {
    technologies?: string;
  };
}

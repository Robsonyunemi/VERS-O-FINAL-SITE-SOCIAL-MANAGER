
export type GridItemType = 'social' | 'text' | 'image' | 'link' | 'map';

export interface GridItem {
  id: string;
  type: GridItemType;
  title: string;
  subtitle?: string;
  content?: string;
  url?: string;
  imageUrl?: string;
  colSpan?: number;
  rowSpan?: number;
  icon?: string;
}

export interface Visitor {
  id: string;
  instagram: string;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  role: string;
  avatar: string;
  email: string;
  instagram: string;
  whatsapp: string;
  whatsappMessage: string;
  driveLink: string;
}

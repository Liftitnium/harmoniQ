import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Home,
  Map,
  Music2,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
  badgeCount?: number;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/roadmap", label: "Roadmap", Icon: Map },
  { href: "/progress", label: "Progress", Icon: BarChart3 },
  { href: "/sheet-music", label: "Extras", Icon: Music2 },
];

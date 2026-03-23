import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CalendarCheck,
  Home,
  MessageSquare,
  Music2,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { MESSAGES_UNREAD_COUNT } from "@/lib/data";

export type NavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
  /** Small numeric badge (e.g. unread messages) */
  badgeCount?: number;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/tutors", label: "Tutors", Icon: UserRound },
  { href: "/sheet-music", label: "Sheet Music", Icon: Music2 },
  {
    href: "/practice-plan",
    label: "Practice Plan",
    Icon: CalendarCheck,
  },
  { href: "/progress", label: "Progress", Icon: BarChart3 },
  {
    href: "/messages",
    label: "Messages",
    Icon: MessageSquare,
    badgeCount: MESSAGES_UNREAD_COUNT,
  },
  { href: "/community", label: "Community", Icon: Users },
  { href: "/leaderboard", label: "Leaderboard", Icon: Trophy },
];

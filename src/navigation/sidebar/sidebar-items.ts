import {
  BookOpenIcon,
  BotIcon,
  GaugeIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  type LucideIcon,
  MessageSquareIcon,
  MessagesSquareIcon,
  ScrollTextIcon,
  SendIcon,
  SettingsIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";

import type { Capability } from "@/lib/auth/capabilities";

export type NavBadge = "new" | "updated" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
  /** Hidden unless the current role holds this capability. */
  capability?: Capability;
}

interface NavItemBase {
  id: string;
  title: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
  capability?: Capability;
}

export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Platform",
    items: [
      {
        id: "overview",
        title: "Overview",
        url: "/dashboard/overview",
        icon: LayoutDashboardIcon,
      },
      {
        id: "assistants",
        title: "Assistants",
        url: "/dashboard/assistants",
        icon: BotIcon,
        capability: "assistant:read",
      },
      {
        id: "knowledge",
        title: "Knowledge",
        url: "/dashboard/knowledge",
        icon: BookOpenIcon,
        capability: "knowledge:read",
      },
      {
        id: "playground",
        title: "Playground",
        url: "/dashboard/playground",
        icon: MessageSquareIcon,
        capability: "chat:write",
      },
      {
        id: "conversations",
        title: "Conversations",
        url: "/dashboard/conversations",
        icon: MessagesSquareIcon,
        capability: "conversation:read",
      },
    ],
  },
  {
    id: 2,
    label: "Operations",
    items: [
      {
        id: "policies",
        title: "Policy lab",
        url: "/dashboard/policies",
        icon: ShieldCheckIcon,
        capability: "policy:evaluate",
      },
      {
        id: "usage",
        title: "Usage",
        url: "/dashboard/usage",
        icon: GaugeIcon,
        capability: "usage:read",
      },
      {
        id: "api-keys",
        title: "API keys",
        url: "/dashboard/api-keys",
        icon: KeyRoundIcon,
        capability: "apikey:read",
      },
      {
        id: "channels",
        title: "Channels",
        url: "/dashboard/channels",
        icon: SendIcon,
        capability: "channel:read",
      },
      {
        id: "audit",
        title: "Audit log",
        url: "/dashboard/audit",
        icon: ScrollTextIcon,
        capability: "audit:read",
      },
    ],
  },
  {
    id: 3,
    label: "Organization",
    items: [
      {
        id: "members",
        title: "Members",
        url: "/dashboard/members",
        icon: UsersIcon,
        capability: "member:read",
      },
      {
        id: "settings",
        title: "Settings",
        icon: SettingsIcon,
        subItems: [
          { id: "settings-general", title: "General", url: "/dashboard/settings", capability: "organization:read" },
          { id: "settings-account", title: "Account", url: "/dashboard/settings/account" },
          { id: "settings-security", title: "Security", url: "/dashboard/settings/security" },
        ],
      },
    ],
  },
];

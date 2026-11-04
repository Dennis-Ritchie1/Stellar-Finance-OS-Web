import {
  ArrowLeftRight,
  BarChart3,
  CheckSquare,
  Download,
  FileText,
  LayoutDashboard,
  Send,
  Settings,
  Store,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/vendors', label: 'Vendors', icon: Store },
  { to: '/payments/outgoing', label: 'Payments', icon: Send },
  { to: '/approvals', label: 'Approvals', icon: CheckSquare },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/exports', label: 'Exports', icon: Download },
  { to: '/settings', label: 'Settings', icon: Settings },
];

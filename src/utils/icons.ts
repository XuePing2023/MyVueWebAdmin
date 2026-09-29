import {
  Activity,
  BarChart3,
  Bell,
  Calendar,
  CreditCard,
  Database,
  FileText,
  FolderOpen,
  Gauge,
  Home,
  LayoutDashboard,
  Mail,
  Menu as MenuIcon,
  MessageSquare,
  Search,
  Server,
  Settings,
  Shield,
  ShoppingCart,
  Tag,
  User,
  Users,
  type LucideIcon,
} from 'lucide-vue-next'

/** 菜单可用图标映射（图标名 -> lucide 组件） */
export const iconMap: Record<string, LucideIcon> = {
  gauge: Gauge,
  dashboard: LayoutDashboard,
  user: User,
  users: Users,
  shield: Shield,
  menu: MenuIcon,
  settings: Settings,
  bell: Bell,
  search: Search,
  home: Home,
  file: FileText,
  database: Database,
  server: Server,
  activity: Activity,
  folder: FolderOpen,
  tag: Tag,
  cart: ShoppingCart,
  card: CreditCard,
  chart: BarChart3,
  calendar: Calendar,
  mail: Mail,
  message: MessageSquare,
}

export const iconNames = Object.keys(iconMap)

export function getIcon(name?: string): LucideIcon | undefined {
  return name ? iconMap[name] : undefined
}

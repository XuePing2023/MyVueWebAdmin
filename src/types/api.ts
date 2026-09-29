/** 后端统一响应封装 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/** 分页查询结果 */
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/** 状态：0-禁用 1-启用 */
export type StatusType = 0 | 1

/** 当前登录用户信息 */
export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  roles: string[]
  email: string
  phone: string
  bio: string
}

export interface LoginParams {
  username: string
  password: string
  remember?: boolean
}

export interface LoginResult {
  token: string
  userInfo: UserInfo
}

/** 系统用户 */
export interface UserItem {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  roles: string[]
  status: StatusType
  createdAt: string
  remark: string
}

/** 角色 */
export interface RoleItem {
  id: number
  name: string
  code: string
  description: string
  status: StatusType
  createdAt: string
  /** 拥有的菜单/权限 ID 集合 */
  menuIds: number[]
}

/** 菜单类型：目录 / 菜单 / 按钮 */
export type MenuType = 'dir' | 'menu' | 'button'

export interface MenuItem {
  id: number
  parentId: number
  type: MenuType
  name: string
  /** 路由地址（dir/menu） */
  path: string
  /** 权限标识（button/menu） */
  perms: string
  /** 图标名（lucide） */
  icon: string
  order: number
  status: StatusType
  visible: StatusType
  createdAt: string
  children: MenuItem[]
}

export interface TodoItem {
  id: number
  title: string
  done: boolean
}

export interface NoticeItem {
  id: number
  title: string
  time: string
  level: 'info' | 'success' | 'warning'
}

export interface DashboardData {
  stats: {
    userTotal: number
    userGrowth: number
    pvToday: number
    pvGrowth: number
    activeUser: number
    activeGrowth: number
    orderTotal: number
    orderGrowth: number
  }
  /** 近 7 日访问趋势 */
  trend: { date: string; pv: number; uv: number }[]
  /** 用户角色分布 */
  roleDist: { name: string; value: number }[]
  latestUsers: UserItem[]
  todos: TodoItem[]
  notices: NoticeItem[]
}

/** 站内消息通知 */
export interface NotificationItem {
  id: number
  title: string
  content: string
  time: string
  read: boolean
}

/** 登录日志 */
export interface LoginLogItem {
  id: number
  time: string
  ip: string
  location: string
  browser: string
  os: string
  status: StatusType
}

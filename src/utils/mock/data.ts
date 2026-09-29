import type { DashboardData, LoginLogItem, MenuItem, NoticeItem, NotificationItem, RoleItem, TodoItem, UserItem, UserInfo } from '@/types/api'

/** 内置演示账号（在登录页也可一键填充） */
export const accounts = [
  { username: 'admin', password: '123456', roles: ['admin'] as string[] },
  { username: 'user', password: '123456', roles: ['common'] as string[] },
]

export function formatDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function buildUserInfo(username: string): UserInfo {
  if (username === 'admin') {
    return {
      id: 1,
      username: 'admin',
      nickname: '超级管理员',
      avatar: '',
      roles: ['admin'],
      email: 'admin@webadmin.cn',
      phone: '13800000001',
      bio: '系统管理员，负责平台日常运维与权限管理。',
    }
  }
  return {
    id: 2,
    username: 'user',
    nickname: '普通用户',
    avatar: '',
    roles: ['common'],
    email: 'user@webadmin.cn',
    phone: '13800000002',
    bio: '普通用户，仅有查看权限。',
  }
}

const NAME_PAIRS: [string, string][] = [
  ['zhangwei', '张伟'], ['wangfang', '王芳'], ['lina', '李娜'], ['liuyang', '刘洋'],
  ['chenjing', '陈静'], ['yangfan', '杨帆'], ['zhaolei', '赵磊'], ['huangmin', '黄敏'],
  ['zhoujie', '周杰'], ['wuli', '吴丽'], ['xuqiang', '徐强'], ['sunyan', '孙艳'],
  ['machao', '马超'], ['zhuting', '朱婷'], ['hujun', '胡军'], ['guotao', '郭涛'],
  ['linxia', '林霞'], ['heping', '何平'], ['gaoyuan', '高远'], ['luodan', '罗丹'],
  ['tangyu', '唐宇'], ['hanxue', '韩雪'], ['caopeng', '曹鹏'], ['dengmei', '邓梅'],
]

function seedUsers(): UserItem[] {
  const rolePool = ['admin', 'operator', 'common']
  return NAME_PAIRS.map(([username, nickname], i) => ({
    id: i + 10,
    username: i < 20 ? username : `${username}02`,
    nickname: i < 20 ? nickname : `${nickname}`,
    email: `${i < 20 ? username : `${username}02`}@example.com`,
    phone: `1${3 + (i % 7)}${String(800000000 + i * 4657231).slice(0, 9)}`.slice(0, 11),
    roles: [rolePool[i % 3]],
    status: (i % 9 === 4 ? 0 : 1) as 0 | 1,
    createdAt: formatDateTime(new Date(Date.now() - i * 86400_000 - (i % 7) * 3600_000)),
    remark: i % 5 === 0 ? '运营部' : i % 5 === 1 ? '技术部' : '',
  }))
}

function seedRoles(allMenuIds: number[]): RoleItem[] {
  const now = formatDateTime(new Date(Date.now() - 30 * 86400_000))
  return [
    { id: 1, name: '超级管理员', code: 'admin', description: '拥有系统全部权限', status: 1, createdAt: now, menuIds: [...allMenuIds] },
    { id: 2, name: '运营人员', code: 'operator', description: '负责内容与用户运营', status: 1, createdAt: now, menuIds: [1, 6] },
    { id: 3, name: '访客', code: 'common', description: '只读访问权限', status: 1, createdAt: now, menuIds: [1, 6] },
  ]
}

function seedMenus(): MenuItem[] {
  const base = formatDateTime(new Date(Date.now() - 60 * 86400_000))
  const mk = (m: Partial<MenuItem> & Pick<MenuItem, 'id' | 'type' | 'name'>): MenuItem => ({
    parentId: 0,
    path: '',
    perms: '',
    icon: '',
    order: 0,
    status: 1,
    visible: 1,
    createdAt: base,
    children: [],
    ...m,
  })
  return [
    mk({ id: 1, type: 'menu', name: '仪表盘', path: '/dashboard', icon: 'gauge', order: 1 }),
    mk({
      id: 2,
      type: 'dir',
      name: '系统管理',
      path: '/system',
      icon: 'settings',
      order: 2,
      children: [
        mk({ id: 3, parentId: 2, type: 'menu', name: '用户管理', path: '/system/user', perms: 'system:user:list', icon: 'users', order: 1, children: [
          mk({ id: 7, parentId: 3, type: 'button', name: '用户新增', perms: 'system:user:add', order: 1 }),
          mk({ id: 8, parentId: 3, type: 'button', name: '用户编辑', perms: 'system:user:edit', order: 2 }),
          mk({ id: 9, parentId: 3, type: 'button', name: '用户删除', perms: 'system:user:delete', order: 3 }),
        ] }),
        mk({ id: 4, parentId: 2, type: 'menu', name: '角色管理', path: '/system/role', perms: 'system:role:list', icon: 'shield', order: 2, children: [
          mk({ id: 10, parentId: 4, type: 'button', name: '角色新增', perms: 'system:role:add', order: 1 }),
          mk({ id: 11, parentId: 4, type: 'button', name: '角色编辑', perms: 'system:role:edit', order: 2 }),
          mk({ id: 12, parentId: 4, type: 'button', name: '角色删除', perms: 'system:role:delete', order: 3 }),
        ] }),
        mk({ id: 5, parentId: 2, type: 'menu', name: '菜单管理', path: '/system/menu', perms: 'system:menu:list', icon: 'menu', order: 3, children: [
          mk({ id: 13, parentId: 5, type: 'button', name: '菜单新增', perms: 'system:menu:add', order: 1 }),
          mk({ id: 14, parentId: 5, type: 'button', name: '菜单编辑', perms: 'system:menu:edit', order: 2 }),
          mk({ id: 15, parentId: 5, type: 'button', name: '菜单删除', perms: 'system:menu:delete', order: 3 }),
        ] }),
      ],
    }),
    mk({ id: 6, type: 'menu', name: '个人中心', path: '/profile', icon: 'user', order: 3, visible: 0 }),
  ]
}

function collectIds(menus: MenuItem[], acc: number[] = []): number[] {
  for (const m of menus) {
    acc.push(m.id)
    if (m.children.length) collectIds(m.children, acc)
  }
  return acc
}

const menus = seedMenus()

export const db = {
  users: seedUsers(),
  roles: seedRoles(collectIds(menus)),
  menus,
  notifications: [
    { id: 1, title: '系统升级通知', content: 'WebAdmin 将于本周六 02:00 - 04:00 进行系统升级，届时服务可能短暂不可用。', time: formatDateTime(new Date(Date.now() - 3600_000)), read: false },
    { id: 2, title: '新的用户注册', content: '用户「张伟」刚刚完成了注册，请及时审核。', time: formatDateTime(new Date(Date.now() - 7200_000)), read: false },
    { id: 3, title: '安全提醒', content: '检测到您的账号在新设备登录，如非本人操作请及时修改密码。', time: formatDateTime(new Date(Date.now() - 86400_000)), read: false },
    { id: 4, title: '版本发布', content: 'WebAdmin v1.0.0 正式发布，新增暗黑模式、多标签页等特性。', time: formatDateTime(new Date(Date.now() - 2 * 86400_000)), read: true },
  ] as NotificationItem[],
  loginLogs: [
    { id: 1, time: formatDateTime(new Date(Date.now() - 3600_000)), ip: '192.168.1.101', location: '广东省深圳市', browser: 'Chrome 130', os: 'Windows 11', status: 1 },
    { id: 2, time: formatDateTime(new Date(Date.now() - 86400_000)), ip: '192.168.1.101', location: '广东省深圳市', browser: 'Chrome 130', os: 'Windows 11', status: 1 },
    { id: 3, time: formatDateTime(new Date(Date.now() - 2 * 86400_000)), ip: '113.88.56.32', location: '广东省广州市', browser: 'Edge 130', os: 'Windows 10', status: 1 },
    { id: 4, time: formatDateTime(new Date(Date.now() - 3 * 86400_000)), ip: '223.104.3.87', location: '广东省深圳市', browser: 'Safari', os: 'iOS 18', status: 1 },
    { id: 5, time: formatDateTime(new Date(Date.now() - 5 * 86400_000)), ip: '58.62.100.4', location: '广东省广州市', browser: 'Chrome 129', os: 'macOS 14', status: 0 },
  ] as LoginLogItem[],
  todos: [
    { id: 1, title: '审核新注册用户资料', done: false },
    { id: 2, title: '确认系统升级窗口时间', done: false },
    { id: 3, title: '回复运营周报反馈', done: false },
    { id: 4, title: '整理权限矩阵文档', done: true },
  ] as TodoItem[],
  notices: [
    { id: 1, title: 'WebAdmin v1.0.0 正式发布', time: '2026-09-20', level: 'success' },
    { id: 2, title: '本周六凌晨系统升级维护', time: '2026-09-24', level: 'warning' },
    { id: 3, title: '新增暗黑模式与多标签页', time: '2026-09-25', level: 'info' },
  ] as NoticeItem[],
}

export function nextId(list: { id: number }[]): number {
  return list.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

export function getDashboardData(): DashboardData {
  const trend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400_000)
    const pv = 1800 + ((i * 373) % 1400)
    return { date: `${d.getMonth() + 1}/${d.getDate()}`, pv, uv: Math.round(pv / 2.8) }
  })
  const roleCount = (code: string) => db.users.filter(u => u.roles.includes(code)).length
  return {
    stats: {
      userTotal: db.users.length,
      userGrowth: 12.5,
      pvToday: trend[6].pv,
      pvGrowth: 8.2,
      activeUser: 328,
      activeGrowth: -2.1,
      orderTotal: 1286,
      orderGrowth: 4.6,
    },
    trend,
    roleDist: [
      { name: '超级管理员', value: roleCount('admin') },
      { name: '运营人员', value: roleCount('operator') },
      { name: '访客', value: roleCount('common') },
    ],
    latestUsers: [...db.users].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    todos: db.todos,
    notices: db.notices,
  }
}

import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

import type { ApiResponse, MenuItem, UserItem } from '@/types/api'
import { accounts, buildUserInfo, db, formatDateTime, getDashboardData, nextId } from './data'

/**
 * 极简内置 Mock：通过自定义 axios adapter 拦截请求
 * 无需任何额外依赖与后端服务，即可体验完整的增删改查流程
 */

interface MockContext {
  params: Record<string, unknown>
  body: Record<string, unknown>
  match: RegExpMatchArray
  token: string
}

interface MockRoute {
  method: string
  pattern: RegExp
  handler: (ctx: MockContext) => ApiResponse<unknown> | Promise<ApiResponse<unknown>>
}

const ok = <T>(data: T): ApiResponse<T> => ({ code: 0, message: 'ok', data })
const fail = (message: string): ApiResponse<null> => ({ code: 1, message, data: null })

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function findMenuById(menus: MenuItem[], id: number): MenuItem | undefined {
  for (const m of menus) {
    if (m.id === id) return m
    const found = findMenuById(m.children, id)
    if (found) return found
  }
  return undefined
}

function removeMenuById(menus: MenuItem[], id: number): boolean {
  const index = menus.findIndex(m => m.id === id)
  if (index > -1) {
    menus.splice(index, 1)
    return true
  }
  return menus.some(m => removeMenuById(m.children, id))
}

function paginate<T>(list: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  return { list: list.slice(start, start + pageSize), total: list.length, page, pageSize }
}

const routes: MockRoute[] = [
  // ---------- 认证 ----------
  {
    method: 'post',
    pattern: /^\/auth\/login$/,
    handler: ({ body }) => {
      const username = String(body.username ?? '')
      const password = String(body.password ?? '')
      const account = accounts.find(a => a.username === username)
      if (!account || account.password !== password) {
        return fail('用户名或密码错误')
      }
      return ok({
        token: `mock-${username}-${Date.now()}`,
        userInfo: buildUserInfo(username),
      })
    },
  },
  {
    method: 'post',
    pattern: /^\/auth\/logout$/,
    handler: () => ok(null),
  },
  {
    method: 'get',
    pattern: /^\/auth\/info$/,
    handler: ({ token }) => {
      // token 形如 mock-<username>-<ts>
      const username = token.split('-')[1]
      if (!accounts.some(a => a.username === username)) {
        return fail('登录状态已失效')
      }
      return ok(buildUserInfo(username))
    },
  },

  // ---------- 用户管理 ----------
  {
    method: 'get',
    pattern: /^\/user\/page$/,
    handler: ({ params }) => {
      const page = Number(params.page ?? 1)
      const pageSize = Number(params.pageSize ?? 10)
      const keyword = String(params.keyword ?? '').trim()
      const status = params.status
      let list = [...db.users].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      if (keyword) {
        list = list.filter(u => [u.username, u.nickname, u.email, u.phone].some(v => v.includes(keyword)))
      }
      if (status !== undefined && status !== '') {
        list = list.filter(u => u.status === Number(status))
      }
      return ok(paginate(list, page, pageSize))
    },
  },
  {
    method: 'post',
    pattern: /^\/user$/,
    handler: ({ body }) => {
      const username = String(body.username ?? '')
      if (db.users.some(u => u.username === username)) {
        return fail(`用户名「${username}」已存在`)
      }
      const user: UserItem = {
        id: nextId(db.users),
        username,
        nickname: String(body.nickname ?? username),
        email: String(body.email ?? ''),
        phone: String(body.phone ?? ''),
        roles: body.roles ? (body.roles as string[]) : [],
        status: (body.status ?? 1) as 0 | 1,
        createdAt: formatDateTime(new Date()),
        remark: String(body.remark ?? ''),
      }
      db.users.unshift(user)
      return ok(user)
    },
  },
  {
    method: 'put',
    pattern: /^\/user\/(\d+)\/status$/,
    handler: ({ match, body }) => {
      const user = db.users.find(u => u.id === Number(match[1]))
      if (!user) return fail('用户不存在')
      user.status = Number(body.status) as 0 | 1
      return ok(null)
    },
  },
  {
    method: 'post',
    pattern: /^\/user\/batch-delete$/,
    handler: ({ body }) => {
      const ids = (body.ids ?? []) as number[]
      db.users = db.users.filter(u => !ids.includes(u.id))
      return ok(null)
    },
  },
  {
    method: 'put',
    pattern: /^\/user\/(\d+)$/,
    handler: ({ match, body }) => {
      const user = db.users.find(u => u.id === Number(match[1]))
      if (!user) return fail('用户不存在')
      Object.assign(user, body, { id: user.id })
      return ok(null)
    },
  },
  {
    method: 'delete',
    pattern: /^\/user\/(\d+)$/,
    handler: ({ match }) => {
      const id = Number(match[1])
      if (id === 1) return fail('内置管理员不允许删除')
      db.users = db.users.filter(u => u.id !== id)
      return ok(null)
    },
  },

  // ---------- 角色管理 ----------
  {
    method: 'get',
    pattern: /^\/role\/list$/,
    handler: () => ok(clone(db.roles)),
  },
  {
    method: 'post',
    pattern: /^\/role$/,
    handler: ({ body }) => {
      const code = String(body.code ?? '')
      if (db.roles.some(r => r.code === code)) {
        return fail(`权限字符「${code}」已存在`)
      }
      const role = {
        id: nextId(db.roles),
        name: String(body.name ?? ''),
        code,
        description: String(body.description ?? ''),
        status: (body.status ?? 1) as 0 | 1,
        createdAt: formatDateTime(new Date()),
        menuIds: [] as number[],
      }
      db.roles.push(role)
      return ok(role)
    },
  },
  {
    method: 'put',
    pattern: /^\/role\/(\d+)\/menus$/,
    handler: ({ match, body }) => {
      const role = db.roles.find(r => r.id === Number(match[1]))
      if (!role) return fail('角色不存在')
      role.menuIds = (body.menuIds ?? []) as number[]
      return ok(null)
    },
  },
  {
    method: 'put',
    pattern: /^\/role\/(\d+)$/,
    handler: ({ match, body }) => {
      const role = db.roles.find(r => r.id === Number(match[1]))
      if (!role) return fail('角色不存在')
      if (role.code === 'admin' && body.code && body.code !== 'admin') {
        return fail('内置角色不允许修改权限字符')
      }
      Object.assign(role, body, { id: role.id })
      return ok(null)
    },
  },
  {
    method: 'delete',
    pattern: /^\/role\/(\d+)$/,
    handler: ({ match }) => {
      const id = Number(match[1])
      const role = db.roles.find(r => r.id === id)
      if (!role) return fail('角色不存在')
      if (role.code === 'admin') return fail('内置角色不允许删除')
      if (db.users.some(u => u.roles.includes(role.code))) {
        return fail('该角色已分配给用户，无法删除')
      }
      db.roles = db.roles.filter(r => r.id !== id)
      return ok(null)
    },
  },

  // ---------- 菜单管理 ----------
  {
    method: 'get',
    pattern: /^\/menu\/tree$/,
    handler: () => ok(clone(db.menus)),
  },
  {
    method: 'post',
    pattern: /^\/menu$/,
    handler: ({ body }) => {
      const parentId = Number(body.parentId ?? 0)
      if (parentId !== 0 && !findMenuById(db.menus, parentId)) {
        return fail('上级菜单不存在')
      }
      const menu: MenuItem = {
        id: nextId(db.menus.flatMap(m => [m, ...m.children.flatMap(c => [c, ...c.children])])),
        parentId,
        type: (body.type ?? 'menu') as MenuItem['type'],
        name: String(body.name ?? ''),
        path: String(body.path ?? ''),
        perms: String(body.perms ?? ''),
        icon: String(body.icon ?? ''),
        order: Number(body.order ?? 0),
        status: (body.status ?? 1) as 0 | 1,
        visible: (body.visible ?? 1) as 0 | 1,
        createdAt: formatDateTime(new Date()),
        children: [],
      }
      if (parentId === 0) {
        db.menus.push(menu)
      }
      else {
        findMenuById(db.menus, parentId)!.children.push(menu)
      }
      return ok(menu)
    },
  },
  {
    method: 'put',
    pattern: /^\/menu\/(\d+)$/,
    handler: ({ match, body }) => {
      const menu = findMenuById(db.menus, Number(match[1]))
      if (!menu) return fail('菜单不存在')
      const parentId = Number(body.parentId ?? menu.parentId)
      if (parentId !== menu.parentId && (parentId === menu.id || findMenuById(menu.children, parentId))) {
        return fail('不能将菜单移动到自身或其子级下')
      }
      Object.assign(menu, body, { id: menu.id, parentId })
      return ok(null)
    },
  },
  {
    method: 'delete',
    pattern: /^\/menu\/(\d+)$/,
    handler: ({ match }) => {
      const menu = findMenuById(db.menus, Number(match[1]))
      if (!menu) return fail('菜单不存在')
      if (menu.children.length) return fail('存在子菜单，请先删除子菜单')
      removeMenuById(db.menus, menu.id)
      return ok(null)
    },
  },

  // ---------- 仪表盘 ----------
  {
    method: 'get',
    pattern: /^\/dashboard\/all$/,
    handler: () => ok(getDashboardData()),
  },

  // ---------- 消息通知 ----------
  {
    method: 'get',
    pattern: /^\/notify\/list$/,
    handler: () => ok(clone(db.notifications)),
  },
  {
    method: 'post',
    pattern: /^\/notify\/read-all$/,
    handler: () => {
      db.notifications.forEach(n => (n.read = true))
      return ok(null)
    },
  },

  // ---------- 个人中心 ----------
  {
    method: 'put',
    pattern: /^\/profile$/,
    handler: ({ body, token }) => {
      const username = token.split('-')[1]
      const account = accounts.find(a => a.username === username)
      if (!account) return fail('登录状态已失效')
      const info = buildUserInfo(username)
      info.nickname = String(body.nickname ?? info.nickname)
      info.email = String(body.email ?? info.email)
      info.phone = String(body.phone ?? info.phone)
      info.bio = String(body.bio ?? info.bio)
      return ok(info)
    },
  },
  {
    method: 'put',
    pattern: /^\/profile\/password$/,
    handler: ({ body, token }) => {
      const username = token.split('-')[1]
      const account = accounts.find(a => a.username === username)
      if (!account || account.password !== String(body.oldPassword ?? '')) {
        return fail('原密码不正确')
      }
      account.password = String(body.newPassword ?? '')
      return ok(null)
    },
  },
  {
    method: 'get',
    pattern: /^\/profile\/logs$/,
    handler: () => ok(clone(db.loginLogs)),
  },
]

export function installMock(instance: AxiosInstance) {
  instance.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    const method = (config.method || 'get').toLowerCase()
    const rawUrl = config.url || ''
    const base = import.meta.env.VITE_BASE_API || ''
    const path = base && rawUrl.startsWith(base) ? rawUrl.slice(base.length) : rawUrl
    const body = typeof config.data === 'string' ? JSON.parse(config.data) : (config.data ?? {}) as Record<string, unknown>
    const token = String(config.headers?.Authorization ?? '').replace('Bearer ', '')

    for (const route of routes) {
      if (route.method !== method) continue
      const match = path.match(route.pattern)
      if (!match) continue

      await sleep(150 + Math.random() * 250)
      const result = await route.handler({ params: (config.params ?? {}) as Record<string, unknown>, body, match, token })
      const response: AxiosResponse = {
        data: result,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }
      return response
    }

    throw new Error(`Mock 未实现的接口: ${method.toUpperCase()} ${path}`)
  }
}

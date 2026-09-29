import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { useTabStore } from '@/stores/modules/tab'
import { useUserStore } from '@/stores/modules/user'

/** 常量路由：无需权限即可访问 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hideInMenu: true, hideInTab: true },
  },
  {
    path: '/redirect/:path(.*)',
    name: 'Redirect',
    component: () => import('@/views/redirect/index.vue'),
    meta: { title: '刷新', hideInMenu: true, hideInTab: true },
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/BasicLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'gauge', affix: true },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心', icon: 'user', hideInMenu: true },
      },
    ],
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: { title: '无权限访问', hideInMenu: true, hideInTab: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在', hideInMenu: true, hideInTab: true },
  },
]

/** 动态路由：登录后按角色过滤，挂载到 Layout 下 */
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/system',
    name: 'System',
    component: () => import('@/components/ParentView.vue'),
    redirect: '/system/user',
    meta: { title: '系统管理', icon: 'settings', roles: ['admin'] },
    children: [
      {
        path: 'user',
        name: 'SystemUser',
        component: () => import('@/views/system/user.vue'),
        meta: { title: '用户管理', icon: 'users' },
      },
      {
        path: 'role',
        name: 'SystemRole',
        component: () => import('@/views/system/role.vue'),
        meta: { title: '角色管理', icon: 'shield' },
      },
      {
        path: 'menu',
        name: 'SystemMenu',
        component: () => import('@/views/system/menu.vue'),
        meta: { title: '菜单管理', icon: 'menu' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
})

/** 是否已完成动态路由注册（登录/刷新后各注册一次） */
let accessRoutesAdded = false

/** 按角色过滤动态路由 */
export function filterAsyncRoutes(routes: RouteRecordRaw[], roles: string[]): RouteRecordRaw[] {
  const result: RouteRecordRaw[] = []
  for (const route of routes) {
    const clone = { ...route }
    if (clone.meta?.roles && !clone.meta.roles.some(role => roles.includes(role))) {
      continue
    }
    if (clone.children) {
      clone.children = filterAsyncRoutes(clone.children, roles)
      if (clone.children.length === 0 && clone.meta?.roles) continue
    }
    result.push(clone)
  }
  return result
}

/** 将有权限的动态路由挂载到 Layout 下 */
export function addAccessRoutes(roles: string[]) {
  filterAsyncRoutes(asyncRoutes, roles).forEach(route => router.addRoute('Layout', route))
  accessRoutesAdded = true
}

router.beforeEach(async (to) => {
  const userStore = useUserStore()

  // 未登录：仅放行登录页
  if (to.path === '/login') {
    return userStore.isLoggedIn ? { path: '/' } : true
  }
  if (!userStore.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  // 已登录但无用户信息（页面刷新）：拉取用户信息
  if (!userStore.userInfo) {
    try {
      await userStore.getInfo()
    }
    catch {
      userStore.resetToken()
      return { path: '/login', query: { redirect: to.fullPath } }
    }
  }

  // 注册动态路由后重新进入目标路由
  if (!accessRoutesAdded) {
    addAccessRoutes(userStore.roles)
    return { path: to.path, query: to.query, hash: to.hash, replace: true }
  }

  // 角色权限校验
  if (to.meta.roles?.length && !to.meta.roles.some(r => userStore.roles.includes(r))) {
    return { path: '/403' }
  }

  return true
})

router.afterEach((to) => {
  const title = import.meta.env.VITE_APP_TITLE || 'WebAdmin'
  document.title = to.meta.title ? `${to.meta.title} · ${title}` : title

  const tabStore = useTabStore()
  tabStore.addTab(to)
})

export default router

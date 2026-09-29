import type { RouteRecordRaw } from 'vue-router'

import { constantRoutes, asyncRoutes, filterAsyncRoutes } from '@/router'

export interface MenuNode {
  path: string
  title: string
  icon?: string
  children?: MenuNode[]
}

function toNode(route: RouteRecordRaw, basePath = ''): MenuNode | null {
  const meta = route.meta ?? {}
  if (meta.hideInMenu) return null
  const path = route.path.startsWith('/') ? route.path : `${basePath}/${route.path}`
  const children = (route.children ?? [])
    .map(child => toNode(child, path))
    .filter((node): node is MenuNode => node !== null)
  return {
    path,
    title: meta.title ?? '',
    icon: meta.icon,
    children: children.length ? children : undefined,
  }
}

/** 根据角色生成侧边栏菜单树 */
export function generateMenus(roles: string[]): MenuNode[] {
  const nodes: MenuNode[] = []
  const layout = constantRoutes.find(r => r.name === 'Layout')
  layout?.children?.forEach((route) => {
    const node = toNode(route, '/')
    if (node && node.title) nodes.push(node)
  })
  filterAsyncRoutes(asyncRoutes, roles).forEach((route) => {
    const node = toNode(route)
    if (node && node.title) nodes.push(node)
  })
  return nodes
}

/** 扁平化菜单（用于搜索快捷导航） */
export function flattenMenus(menus: MenuNode[], parent?: MenuNode): Array<MenuNode & { parentTitle?: string }> {
  const result: Array<MenuNode & { parentTitle?: string }> = []
  for (const menu of menus) {
    if (menu.children?.length) {
      result.push(...flattenMenus(menu.children, menu))
    }
    else {
      result.push({ ...menu, parentTitle: parent?.title })
    }
  }
  return result
}

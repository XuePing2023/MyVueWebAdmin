# WebAdmin 后台管理系统

基于 **Vue 3 + TypeScript + Vite + UnoCSS + shadcn/ui** 的开箱即用后台管理系统，内置完整 Mock 数据，**无需后端即可运行全部功能**。

## ✨ 特性

- **最新技术栈**：Vue 3.5（`<script setup>`）+ TypeScript + Vite
- **UnoCSS**：`presetWind3`（Tailwind 兼容）+ shadcn/ui 主题色 CSS 变量体系
- **shadcn/ui 组件库**：基于 [reka-ui](https://reka-ui.com/) 无头组件手写 30+ 组件（Button / Dialog / Table / Select / DropdownMenu / Tabs / Sheet / Toast …），代码全部本地化、可自由修改
- **开箱即用**：内置极简 Mock 层（axios adapter 实现），登录、增删改查全流程无需后端
- **权限方案**：角色驱动的动态路由 + 菜单生成 + 路由守卫
- **主题系统**：亮 / 暗模式一键切换（持久化，刷新不闪屏），ECharts 图表配色自动跟随
- **多标签页**：右键菜单（刷新 / 关闭其他 / 关闭右侧）、keep-alive 页面缓存
- **热门生态**：Vue Router、Pinia、Axios、VueUse、ECharts、lucide 图标

## 🚀 快速开始

```bash
# 安装依赖（需要 Node.js >= 20.19）
npm install

# 启动开发服务器 → http://localhost:5173
npm run dev

# 类型检查 + 生产构建
npm run build

# 预览生产构建
npm run preview
```

> 本机未安装 Node.js 时，可使用随项目说明准备的便携版 Node（本项目开发时使用了 `D:\Temp\Tools\nodejs`，将其加入 PATH 即可运行上述命令）。

### 演示账号

| 账号 | 密码 | 角色 | 权限 |
| ---- | ---- | ---- | ---- |
| `admin` | `123456` | 超级管理员 | 全部菜单（含系统管理） |
| `user` | `123456` | 普通用户 | 仅仪表盘 / 个人中心 |

登录页支持「一键填充演示账号」。

## 📦 功能清单

| 模块 | 功能 |
| ---- | ---- |
| 登录 | 表单校验、记住我、登录跳转、Token 持久化、401 自动登出 |
| 布局 | 可折叠侧边栏、移动端抽屉菜单、面包屑、多标签页（右键菜单 + 缓存 + 刷新）、Ctrl+K 菜单搜索 |
| 仪表盘 | 统计卡片、访问趋势折线图、角色分布环形图、最新用户、待办、公告 |
| 用户管理 | 分页列表、关键词/状态搜索、批量删除、行内启禁用、新增/编辑弹窗（表单校验） |
| 角色管理 | CRUD、权限分配（树形三态复选框）、内置角色保护 |
| 菜单管理 | 树形表格（展开/折叠）、目录/菜单/按钮三类、图标选择器、级联删除保护 |
| 个人中心 | 基本资料修改、修改密码（强度提示）、登录日志 |
| 其他 | 通知中心（未读标记/全部已读）、403 / 404 页面、全屏、暗黑模式 |

## 🔌 接入真实后端

项目内置 Mock 仅用于演示，接入真实接口只需两步：

1. **关闭 Mock**：修改 `.env.development`（或 `.env.production`）

   ```ini
   VITE_USE_MOCK = false
   VITE_API_TARGET = http://localhost:8080   # 你的后端地址
   ```

2. **实现接口约定**：统一响应封装 `{ code, message, data }`，`code === 0` 表示成功；分页返回 `{ list, total, page, pageSize }`。接口清单见 `src/api/` 与 `src/utils/mock/index.ts`。

请求封装 `src/utils/http.ts` 已支持：自动携带 `Authorization: Bearer <token>`、业务错误统一 Toast、401 清除登录态跳转登录页。

## 🗂 目录结构

```
src/
├── api/               # 接口定义（auth/user/role/menu/dashboard/notify/profile）
├── components/
│   ├── ui/            # shadcn/ui 风格基础组件（30+，基于 reka-ui + cva）
│   ├── layout/        # 侧边栏、头部、标签页、面包屑、搜索弹窗
│   ├── EChart.vue     # ECharts 通用封装（自适应/主题联动）
│   ├── ConfirmDialog.vue / FormField.vue / TablePagination.vue / Toaster.vue
├── layouts/BasicLayout.vue   # 主布局（侧边栏 + 头部 + 标签页 + keep-alive 路由出口）
├── router/            # 常量/动态路由、守卫、权限过滤
├── stores/            # Pinia：user（登录态）、app（主题/侧栏）、tab（多标签页）
├── styles/index.css   # shadcn 主题变量（亮/暗）、动画、过渡
├── types/             # 全局类型（API 模型、RouteMeta 扩展）
├── utils/             # http 封装、mock、cn、toast、图标映射、图表工具
└── views/             # 登录 / 仪表盘 / 系统管理（用户·角色·菜单）/ 个人中心 / 错误页
```

## 🎨 新增页面步骤

1. 在 `src/views/` 下新建页面组件，并用 `defineOptions({ name: 'XxxPage' })` 命名（用于 keep-alive）；
2. 在 `src/router/index.ts` 的 `asyncRoutes` 中注册路由（`meta.title` / `meta.icon` / `meta.roles` 可选）；
3. 完成 —— 侧边栏菜单、面包屑、标签页、权限过滤自动生效。

## 📝 主题定制

编辑 `src/styles/index.css` 中的 CSS 变量（HSL 通道值）即可全局换肤；组件色值通过 `uno.config.ts` 映射到这些变量（如 `bg-primary`、`text-muted-foreground`）。

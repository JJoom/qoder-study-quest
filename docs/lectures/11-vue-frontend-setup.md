# 第 11 讲 · Vue 前端工程搭建

> 从本讲起转战前端。你将用同样的 AI 方法论（规格先行、样板约束、逐步验证）搭建 Vue 3 工程底座：项目初始化、路由、状态管理、请求封装。

## 1. 学习目标与本讲地图

学完本讲，你将能够：

- [ ] 用 AI 初始化 Vue 3 + Vite 工程并配置 Element Plus、Pinia、Router、Axios
- [ ] 实现前台/后台双布局与路由结构
- [ ] 封装 Axios 请求：统一处理响应体、401 跳转、token 携带
- [ ] 实现登录状态管理（Pinia + localStorage）与路由守卫
- [ ] 配置 Vite 代理解决开发环境跨域

本讲地图：

```
工程初始化 → 依赖与目录 → Axios 封装 → 登录与路由守卫 → 双布局 → 跨域代理
```

## 2. 术语表

| 术语 | 一句话理解 |
| --- | --- |
| Vite | 新一代前端构建工具，开发启动快 |
| SPA（单页应用） | 整个网站只有一个 HTML 页面，切换页面靠 JS 局部刷新 |
| Pinia | Vue 官方状态管理库：把「多个页面共享的数据」（如登录用户）集中管理 |
| 路由守卫 | 页面跳转前的安检：没登录不让进需要登录的页面 |
| Axios 拦截器 | 请求发出前/响应回来后统一加工的位置（加 token、统一报错处理） |
| 开发代理 | 开发时让 Vite 把 /api 请求转发给后端，绕开浏览器跨域限制 |

## 3. 分步实战

> 工作目录：`qshop/qshop-web`。前置：Node.js 18+（`node -v` 验证）。

### 步骤 1：工程初始化

> **提示词示例：**
>
> ```
> 请指导我用 Vite 创建 Vue 3 前端工程 qshop-web（JavaScript 版即可），并安装依赖：
> vue-router、pinia、axios、element-plus、@element-plus/icons-vue。
> 初始化后按项目规格书的目录约定建立 src 骨架：api/ components/ layouts/ router/ stores/ utils/ views/。
> 给我每一步的命令和要创建的文件清单，我确认后再执行。
> ```

**预期产出**：可运行的空工程 + 目录骨架。

**验证**：

```powershell
cd qshop-web
npm run dev
```

浏览器打开提示的地址看到 Vue 欢迎页。

**检查要点**：AI 给的命令逐条看清楚再执行（`npm create vite@latest` 有交互选项，AI 会告诉你选什么）。

### 步骤 2：Axios 统一封装

> **提示词示例：**
>
> ```
> @../qshop-server 的 Result 响应结构 {code, message, data}，请封装 src/utils/request.js：
> 1. baseURL 为 /api/v1
> 2. 请求拦截器：从 localStorage 读取 token，放入 Authorization: Bearer <token>
> 3. 响应拦截器：HTTP 非 2xx 或 code !== 200 时统一 ElMessage 报错并 reject；
>    code === 401 时清除本地登录信息并跳转 /login
> 4. 成功时直接返回 data 字段，简化页面调用
> ```

**预期产出**：`src/utils/request.js` + 按模块组织的 `src/api/*.js` 雏形。

**检查要点**：

- 401 处理没有造成「跳转死循环」（登录页本身的请求失败不应再跳登录页）
- 错误提示用 ElMessage 而不是 alert/console

### 步骤 3：登录状态管理（Pinia）

> **提示词示例：**
>
> ```
> 实现 src/stores/user.js（Pinia store）：
> - state：token、userInfo
> - 持久化：登录后写 localStorage，刷新页面自动恢复
> - actions：login（调 POST /api/v1/auth/login）、logout（清状态+清缓存）
> - getter：isLoggedIn
> ```

**预期产出**：user store。

**验证**：配合第 07 讲的后端登录接口（先把跨域代理配好，见步骤 6），写一个极简登录表单页测试登录成功 → token 入 localStorage → 刷新后状态仍在。

### 步骤 4：路由与路由守卫

> **提示词示例：**
>
> ```
> 配置路由：
> 前台：/（首页占位）、/products（列表占位）、/products/:id（详情占位）、/cart、/orders、/login
> 后台：/admin/products、/admin/categories、/admin/users（占位页即可）
> 路由守卫：访问 /cart /orders /admin/** 未登录则重定向 /login（记住来源地址，登录后跳回）
> 后台路由额外校验：userInfo 角色不含 ROLE_ADMIN 则提示无权限并回首页
> ```

**预期产出**：`src/router/index.js` + 各占位页面。

**验证**：未登录直接输地址访问 /cart → 被弹到 /login；登录后跳回 /cart。

**检查要点**：守卫逻辑只负责「导航决策」，不要在里面调接口——前端守卫防君子不防小人，真正的权限在后端（第 07 讲已做），这里只做体验层拦截。

### 步骤 5：双布局

> **提示词示例：**
>
> ```
> 实现两个布局组件：
> 1. layouts/MainLayout.vue：前台布局——顶部导航（Logo、首页、购物车角标、登录/用户菜单）+ 内容区
> 2. layouts/AdminLayout.vue：后台布局——Element Plus 的 el-container 侧边菜单 + 顶栏 + 内容区
> 路由按布局分组嵌套。
> ```

**预期产出**：两个布局 + 路由嵌套调整。

**验证**：访问前台页与 /admin 页，视觉结构正确，菜单可切换。

### 步骤 6：跨域代理

> **提示词示例：**
>
> ```
> 配置 vite.config.js：开发代理把 /api 与 /files 转发到 http://localhost:8080，并解释原理。
> ```

**预期产出**：proxy 配置。

**原理一句话**：浏览器禁止页面直接请求不同源的接口（跨域限制）；开发时让 Vite 服务器代为转发，浏览器只看到同源请求。生产环境由 Nginx 承担同样角色（第 16 讲）。

**验证**：登录流程走通（前端 → Vite 代理 → 后端 8080）。

## 4. 常见坑与 AI 幻觉识别

1. **Vue 2 写法混入**：`export default { data() {} }` 的 Options API、`Vue.use()`、`this.$router` 等 Vue 2 痕迹出现在 `<script setup>` 项目里，要求改为 Composition API。
2. **Element Plus 全量引入体积警告**：课程范围内全量引入可接受，但让 AI 说明按需引入的方式并记录，作为第 15 讲的优化项。
3. **token 存 localStorage 的安全争议**：这是教学项目的简化方案；真实项目可用 httpOnly cookie + CSRF 防护。让 AI 讲清两者权衡，记录笔记即可，不必本讲实现。
4. **占位页漏建**：路由配了但文件没建，控制台报错。对照路由表逐个检查 views 文件存在。

## 5. 课后练习任务

1. 实现注册页面（对接后端注册接口），注册成功自动跳转登录
2. 顶栏购物车角标显示购物车商品种类数（先静态写死，第 12 讲接真实数据）
3. 给后台布局侧边菜单加上「仅显示当前用户有权限的菜单项」逻辑（基于 userInfo 角色）
4. 让 AI 解释 vite.config.js 代理配置的每一行
5. Git 提交：`feat: 前端工程骨架与登录链路`

## 6. 验收标准清单

- [ ] `npm run dev` 启动成功，双布局页面可访问
- [ ] 登录/退出链路实测通过，刷新页面登录态保持
- [ ] 路由守卫实测：未登录拦截、登录后跳回、非管理员进不了 /admin
- [ ] Axios 封装统一处理了成功解包与错误提示
- [ ] 跨域代理生效，前后端联调无 CORS 报错
- [ ] Git 已提交

下一讲：[第 12 讲 · AI 驱动的前端页面开发](./12-frontend-pages-with-ai.md)——用「规范 + 示例」让 AI 批量产出风格统一的页面。

# qoder-study-quest · RepoWiki

> Qoder AI 企业级开发实战课程的官方文档站源码仓库，承载课程总览、QShop 项目规格书与 16 讲讲义。

## 1. 项目概述

| 项目 | 说明 |
| --- | --- |
| 定位 | 「Qoder AI 企业级开发实战」课程的静态文档站 |
| 目标读者 | AI 编程零基础的开发者、想转型 AI 辅助开发的传统开发者 |
| 实战载体 | QShop 电商系统（Spring Boot + Vue 3，单体架构） |
| 内容规模 | 1 份课程总览 + 1 份项目需求规格书 + 16 讲讲义 |
| 部署方式 | GitHub Pages（GitHub Actions 自动构建部署） |

课程核心理念：AI 是「结对程序员」而非「代码生成器」；先写清楚要什么（Spec 驱动开发），再让 AI 动手；小步快跑、必须审查。

## 2. 技术栈

| 层面 | 技术 | 说明 |
| --- | --- | --- |
| 文档框架 | VitePress ^1.6.3 | 基于 Vite + Vue 的静态站点生成器 |
| 运行时 | Node.js 20.19+（CI 使用 22） | 构建与运行文档站 |
| 搜索 | VitePress 本地搜索 | `search.provider: 'local'` |
| CI/CD | GitHub Actions | 推送 `main` 分支自动部署到 GitHub Pages |

> 注：本仓库只包含文档站。课程中实际开发的 QShop 前后端代码不在本仓库内，讲义会指导学员另行创建。

## 3. 目录结构

```
qoder-study-quest/
├── .github/workflows/
│   └── deploy.yml              # GitHub Pages 自动部署流水线
├── docs/                       # VitePress 文档根目录
│   ├── .vitepress/
│   │   ├── config.mts          # 站点配置（导航、侧边栏、base 等）
│   │   └── dist/               # 构建产物（不提交）
│   ├── index.md                # 课程总览（首页）
│   ├── project-spec.md         # QShop 项目需求规格书（全课程「需求真相源」）
│   └── lectures/               # 16 讲讲义
│       ├── 01-ai-dev-and-qoder-intro.md
│       ├── ...
│       └── 16-deployment-and-summary.md
├── package.json                # NPM 脚本与依赖
└── .gitignore
```

## 4. 内容模块说明

### 4.1 课程入口

| 文件 | 职责 |
| --- | --- |
| `docs/index.md` | 课程简介、学习路线图（4 部分 16 讲）、环境准备清单、学习方法与原则 |
| `docs/project-spec.md` | QShop 需求规格书：技术栈、功能域、数据模型（ER）、API 约定，是讲义内容的对照标准 |

### 4.2 讲义（`docs/lectures/`）

讲义按四个部分组织，与侧边栏分组一一对应：

| 部分 | 讲次 | 主题范围 |
| --- | --- | --- |
| 第一部分：AI 编程认知建立 | 01-03 | AI 编程与 Qoder 初体验、Agent 生态概念（Agent/MCP/Skills/Rules/Harness）、Spec 驱动开发与 OpenSpec 实战 |
| 第二部分：项目启动与后端核心 | 04-10 | 需求分析与项目启动、数据库设计、分层架构脚手架、认证与 RBAC、商品分类、购物车订单、支付库存并发 |
| 第三部分：前端与联调 | 11-13 | Vue 前端搭建、AI 驱动页面开发、前后端联调调试 |
| 第四部分：企业级进阶与总结 | 14-16 | 测试与代码质量、缓存安全性能、部署上线与总结 |

每讲遵循统一结构：学习目标与术语表 → 能力点讲解 → 分步实战（含「给 AI 的提示词示例」「预期产出」「检查要点」）→ 常见坑自查 → 课后练习与验收清单。

### 4.3 站点配置（`docs/.vitepress/config.mts`）

| 配置项 | 值 | 说明 |
| --- | --- | --- |
| `title` / `lang` | Qoder AI 企业级开发实战 / `zh-CN` | 站点标题与语言 |
| `base` | `/qoder-study-quest/` | GitHub Pages 子路径部署必需 |
| `cleanUrls` | `true` | URL 不带 `.html` 后缀 |
| `lastUpdated` | `true` | 页面显示最后更新时间（依赖 git 历史，故 CI 中 `fetch-depth: 0`） |
| `nav` / `sidebar` | 课程入口 + 四部分讲义 | 导航与侧边栏 |
| `search` | 本地搜索 | 无外部服务依赖 |

### 4.4 部署流水线（`.github/workflows/deploy.yml`）

```
push main / 手动触发
  → checkout（fetch-depth: 0，支持 lastUpdated）
  → setup-node 22 + npm cache
  → npm ci
  → npm run docs:build
  → upload-pages-artifact（docs/.vitepress/dist）
  → deploy-pages
```

产物路径为 `docs/.vitepress/dist`，部署到 `https://<user>.github.io/qoder-study-quest/`。

## 5. 构建与运行

前置条件：Node.js 20.19+。

```bash
npm install            # 安装依赖
npm run docs:dev       # 启动本地开发服务器（热更新）
npm run docs:build     # 构建生产版本，输出到 docs/.vitepress/dist
npm run docs:preview   # 预览构建产物
```

## 6. 内容贡献指南

1. **新增讲义**：在 `docs/lectures/` 下按 `NN-短横线标题.md` 命名（NN 为两位讲次号），并在 `config.mts` 的 `sidebar` 对应部分中登记；如属学习路线表格，同步更新 `docs/index.md`。
2. **修改需求口径**：表名、字段名、API 路径的「标准答案」只允许改 `docs/project-spec.md`，讲义须与其保持一致。
3. **术语一致性**：SDD 工具统一称 OpenSpec（npm 包 `@fission-ai/openspec`），命令为 propose → apply → sync/archive；不要使用 Spec Kit 等旧表述。
4. **链接规范**：文档间使用相对路径引用（如 `./lectures/01-xxx.md`），站点开启 `cleanUrls`，部署后由 VitePress 自动处理。
5. **提交后验证**：本地执行 `npm run docs:build` 确认无死链；推送 `main` 后由 Actions 自动部署。

## 7. 常见问题

| 问题 | 原因与处理 |
| --- | --- |
| 部署后静态资源 404 | 检查 `config.mts` 中 `base` 是否为 `/qoder-study-quest/` |
| 「最后更新」时间不显示 | CI 需要 `fetch-depth: 0`；本地需为 git 仓库且有提交历史 |
| 本地预览与线上路径不一致 | 本地 dev 不带 `base` 前缀属正常现象，以构建产物为准 |

# Qoder AI 企业级开发实战课程

> 从 0 到 1，用 AI 辅助开发一个企业级电商系统

## 课程简介

本课程面向 **AI 编程零基础** 的开发者，通过一个完整的企业级电商系统（QShop）实战项目，带你系统掌握如何使用 Qoder 这款 AI IDE 进行企业级应用开发。

学完本课程，你将能够：

- 理解 AI 编程的本质：AI 是你的「结对程序员」，而不是「代码生成器」
- 熟练使用 Qoder 的核心功能：对话、Agent 模式、上下文管理、Rules、Plan Mode
- 理解 Agent 生态的核心概念：MCP、Skills、子 Agent、Harness
- 掌握 Spec 驱动开发（SDD）方法论，并能使用开源轻量工具 OpenSpec 落地
- 独立完成一个 Spring Boot + Vue 的企业级电商系统
- 具备审查 AI 生成代码、识别 AI 幻觉的能力

## 谁适合学这门课

- 有基本的编程基础（懂任意一门语言的基本语法即可），但对 AI 编程完全陌生
- 想转型 AI 辅助开发模式的传统开发者
- 想了解企业级项目完整开发流程（需求 → 设计 → 开发 → 测试 → 部署）的学习者

**不需要** 任何 AI 工具使用经验。所有概念（Agent、MCP、Skills、Spec 驱动开发等）都会从最基础的比喻讲起。

## 实战项目：QShop 电商系统

| 项目 | 说明 |
| --- | --- |
| 架构 | 单体架构（不涉及微服务） |
| 后端 | Spring Boot 3.x + MyBatis-Plus + MySQL 8 + Redis + Spring Security + JWT |
| 前端 | Vue 3 + Vite + Pinia + Element Plus + Axios |
| 工程化 | Maven + Git + Docker |
| 功能 | 用户注册登录、商品/分类、购物车、订单、模拟支付、后台管理（RBAC） |

完整需求规格见 [project-spec.md](./project-spec.md)，它是贯穿全课程的统一「需求真相源」。

## 学习路线图

课程共 16 讲，分四个部分。建议按顺序学习，每讲完成练习后再进入下一讲。

### 第一部分：AI 编程认知建立（第 1-3 讲）

| 讲次 | 主题 | 你将学会 |
| --- | --- | --- |
| [第 01 讲](./lectures/01-ai-dev-and-qoder-intro.md) | AI 编程是什么 + Qoder 初体验 | 与 AI 对话写代码、迭代修改、理解 AI 会犯错 |
| [第 02 讲](./lectures/02-agent-ecosystem-concepts.md) | Agent 生态概念扫盲 | Agent、上下文、Rules、MCP、Skills、子 Agent、Harness 都是什么 |
| [第 03 讲](./lectures/03-openspec-driven-development.md) | Spec 驱动开发与 OpenSpec 实战 | propose → apply → sync/archive 完整流程与 delta 增量规格 |

### 第二部分：项目启动与后端核心（第 4-10 讲）

| 讲次 | 主题 | 你将学会 |
| --- | --- | --- |
| [第 04 讲](./lectures/04-requirements-and-project-setup.md) | 需求分析与项目启动 | 用 OpenSpec 写项目约定与首个提案、初始化工程、配置 Rules |
| [第 05 讲](./lectures/05-database-design.md) | 数据库设计 | 用 AI 做 ER 建模、生成 DDL、设计索引 |
| [第 06 讲](./lectures/06-architecture-and-scaffolding.md) | 分层架构与工程脚手架 | 分层架构、统一响应体、全局异常处理 |
| [第 07 讲](./lectures/07-auth-and-rbac.md) | 认证与 RBAC 权限 | Spring Security + JWT、用户角色权限模型 |
| [第 08 讲](./lectures/08-product-and-category.md) | 商品与分类模块 | 标准 CRUD、分页、文件上传、接口文档 |
| [第 09 讲](./lectures/09-cart-and-order.md) | 购物车与订单 | Redis 购物车、订单状态机 |
| [第 10 讲](./lectures/10-payment-stock-concurrency.md) | 支付、库存与并发 | 事务、库存超卖防护、向 AI 描述并发约束 |

### 第三部分：前端与联调（第 11-13 讲）

| 讲次 | 主题 | 你将学会 |
| --- | --- | --- |
| [第 11 讲](./lectures/11-vue-frontend-setup.md) | Vue 前端工程搭建 | Vite 项目初始化、路由、状态管理、请求封装 |
| [第 12 讲](./lectures/12-frontend-pages-with-ai.md) | AI 驱动的前端页面开发 | 用规范 + 示例引导 AI 生成一致的页面代码 |
| [第 13 讲](./lectures/13-integration-and-debugging.md) | 前后端联调与调试 | 用 AI 分析报错、定位接口问题、处理跨域 |

### 第四部分：企业级进阶与总结（第 14-16 讲）

| 讲次 | 主题 | 你将学会 |
| --- | --- | --- |
| [第 14 讲](./lectures/14-testing-and-code-review.md) | 测试与代码质量 | 让 AI 写测试、代码评审、使用社区 Skills |
| [第 15 讲](./lectures/15-cache-security-performance.md) | 缓存、安全与性能 | Redis 缓存、SQL 优化、安全漏洞排查 |
| [第 16 讲](./lectures/16-deployment-and-summary.md) | 部署上线与课程总结 | Docker 部署、CI/CD、进阶路线 |

## 环境准备清单

开始第 01 讲之前，请准备好以下环境。**每一项的安装步骤、验证命令与常见报错都写在[环境准备手册](./environment-setup.md)里**，遇到「命令找不到」先查它：

| 工具 | 版本要求 | 用途 | 何时用到 |
| --- | --- | --- | --- |
| Qoder | 最新版 | AI IDE，课程主角 | 第 01 讲起全程使用 |
| Python | 3.11+ | 第 01 讲练习与第 03 讲 Todo CLI 演练 | 第 01 讲起 |
| Node.js | 20.19+（兼顾 OpenSpec 与前端） | 安装 OpenSpec CLI、运行 Vue 前端 | 第 03 讲起 |
| JDK | 17+ | 运行 Spring Boot 后端 | 第 04 讲起 |
| Maven | 3.8+ | Java 项目构建 | 第 04 讲起 |
| MySQL | 8.x | 数据库 | 第 05 讲起 |
| Redis | 6.x+（Windows 可用 Docker 版） | 缓存与购物车存储 | 第 09 讲起 |
| Git | 任意较新版本 | 版本控制 | 第 04 讲起 |
| OpenSpec CLI | Node.js 20.19+，`@fission-ai/openspec` 最新版 | Spec 驱动开发工具 | 第 03 讲起 |
| Docker | 任意较新版本（可选） | 容器化部署 | 第 16 讲 |

> 提示：暂时没装 MySQL、Redis 也没关系，课程前半部分（第 1-3 讲）只需要 Qoder、Python 和 Node.js 即可开始。

## 每讲的学习方法

每一讲都遵循相同的结构，建议按下面的方式学习：

1. **读学习目标与术语表**：先搞清楚本讲要干什么、新名词是什么意思
2. **看能力点与企业级知识讲解**：建立概念，不急着动手
3. **跟着分步实战做**：每一步都给出了「给 AI 的提示词示例」「预期产出」「检查要点」，请真的动手敲，不要只看
4. **做完自查「常见坑」**：对照检查 AI 是否给你埋了雷
5. **完成课后练习并对照验收清单**：全部打勾再进入下一讲

## 重要学习原则（贯穿全课程）

1. **AI 生成的代码必须审查**。AI 是助手不是权威，你才是代码的最终责任人。
2. **先想清楚要什么，再让 AI 动手**。这就是 Spec 驱动开发的核心，第 03 讲详述。
3. **小步快跑**。一次让 AI 做一件小事，验证通过再做下一件，永远不要一句话让 AI 写完整个系统。
4. **把约定沉淀成 Rules**。项目规范写进 Rules，AI 才能持续产出风格一致的代码。
5. **报错是最好的老师，也是最好的提示词素材**。把完整报错贴给 AI，往往比重新描述问题更有效。

祝学习愉快。

# 第 04 讲 · 需求分析与项目启动（Spec Kit 主线实战）

> 从本讲起正式进入 QShop 电商项目。本讲用 Spec Kit 完成「立项」：写项目宪法、写总体规格书、定技术方案、配置项目 Rules，并初始化 Spring Boot 工程与 Git 仓库。

## 1. 学习目标与本讲地图

学完本讲，你将能够：

- [ ] 用 Spec Kit 为真实项目制定宪法与总体规格书
- [ ] 用 AI 澄清模糊需求，产出 PRD 级别的需求文档
- [ ] 编写 QShop 的项目级 Rules
- [ ] 初始化 Spring Boot 3 工程骨架并成功启动
- [ ] 建立 Git 仓库与合理的 .gitignore

本讲地图：

```
需求澄清 → 宪法 → 规格书 → 技术方案 → 项目 Rules → 工程初始化 → Git
```

## 2. 术语表

| 术语 | 一句话理解 |
| --- | --- |
| PRD（产品需求文档） | 把「要做什么产品、给谁用、有哪些功能」写清楚的文档 |
| 技术选型 | 决定用什么语言、框架、中间件，以及为什么选它们 |
| 单体架构 | 所有功能打包在一个应用里部署，与微服务相对 |
| 工程骨架（Scaffold） | 只有目录结构和基础配置、还没有业务代码的项目框架 |
| .gitignore | 告诉 Git 哪些文件不用纳入版本管理（如密钥、编译产物） |

## 3. Qoder 能力点讲解

| 能力 | 本讲用法 |
| --- | --- |
| Agent 对话 + Spec Kit 命令 | 生成宪法、规格书、方案 |
| Rules 配置 | 沉淀 QShop 项目规范，后续所有讲持续生效 |
| 终端 | 验证 JDK/Maven、执行 git 命令 |
| 代码生成 | 按宪法与规格生成工程骨架 |

## 4. 企业级知识点：需求分析怎么做

企业级项目开工前必须回答三个问题：

1. **做什么**：功能范围（做什么，同样重要的是**不做什么**）
2. **给谁用**：角色划分（游客、普通用户、管理员）
3. **边界在哪**：非功能要求（性能、安全、数据一致性底线）

QShop 的标准答案已沉淀在课程的 [项目规格书](../project-spec.md)。本讲你要亲手用 AI 把它「重新生产」一遍——这个过程本身比结果更重要。

## 5. 分步实战

> 项目目录建议：新建 `qshop/` 工作目录，后端将放在 `qshop/qshop-server`。

### 步骤 1：用 AI 澄清需求

不要直接甩结论，先让 AI 当需求分析师。

> **提示词示例：**
>
> ```
> 我要做一个教学用的单体电商系统 QShop，面向 C 端用户和管理员。
> 功能范围：用户注册登录、商品分类浏览、购物车、下单、模拟支付、后台商品与用户管理、RBAC 权限。
> 不做的：真实支付渠道、物流发货、优惠券营销、微服务拆分。
> 请作为需求分析师向我提出澄清问题，帮我完善需求。
> ```

**预期产出**：AI 提出一串澄清问题，例如：

- 游客能否浏览商品？加购是否必须登录？
- 订单支持取消吗？已支付订单怎么处理？
- 库存何时扣减（下单时还是支付时）？
- 管理员账号如何产生（种子数据还是页面创建）？

**检查要点**：把每个问题想清楚并回答。参考答案以 [项目规格书](../project-spec.md) 为准（游客可浏览、加购需登录、下单扣库存、管理员用种子数据等）。

### 步骤 2：初始化 Spec Kit 并立宪法

在 `qshop/` 目录执行：

```powershell
specify init . --integration qoder
```

> 若版本不支持 `qoder`，用交互式选择（直接 `specify init .`）或 `--integration generic --integration-options="--commands-dir .speckit-commands"`。

然后在对话中：

> **提示词示例：**
>
> ```
> /speckit.constitution 为 QShop 电商系统制定项目宪法：
> 1. 单体架构，禁止引入微服务组件（网关、注册中心、配置中心等）
> 2. 后端 Spring Boot 3.x + JDK 17 + MyBatis-Plus + MySQL 8 + Redis，前端 Vue 3 + Element Plus
> 3. 分层架构：Controller 只做参数校验与转发，业务逻辑全部在 Service
> 4. 所有接口统一响应体 {code, message, data}，错误码遵循项目错误码表
> 5. 金额计算必须用 BigDecimal 或 DECIMAL，禁止浮点
> 6. 密码 BCrypt 加密，日志禁止输出密码与令牌
> 7. 每个模块实现前必须先有 spec 文档，禁止无规格编码
> ```

**预期产出**：`.specify/memory/constitution.md`。

**检查要点**：逐条核对，特别是第 3、7 条这种「流程性原则」——它们是后面所有讲的护栏。

### 步骤 3：写总体规格书（specify）

> **提示词示例：**
>
> ```
> /speckit.specify 基于我们刚才澄清的需求，为 QShop 编写总体功能规格：
> 角色：游客、注册用户、管理员。
> 功能域：认证、商品浏览（分类/列表/详情）、购物车、订单、模拟支付、后台管理（商品/分类/用户）、RBAC。
> 请输出每个功能域的用户故事与验收标准，并明确列出本期不做的事项。
> ```

**预期产出**：`specs/001-qshop-core/spec.md`，结构与第 03 讲演练一致，但内容覆盖整个 QShop。

**检查要点**：

- 与课程规格书的功能域清单逐条对照，确认无遗漏
- 「本期不做」清单必须存在且清晰（防止后续范围蔓延）

### 步骤 4：制定技术方案（plan）

> **提示词示例：**
>
> ```
> /speckit.plan 技术栈已在宪法中锁定。请制定 QShop 的总体技术方案：
> 后端模块划分（user/auth/category/product/cart/order/payment）、
> 数据模型概览（需要哪些表）、API 规范（统一前缀 /api/v1、统一响应体、分页规范）、
> 认证方案（JWT）、前后端交互方式（REST + JSON）。
> 请先输出方案要点供我确认，不要开始写代码。
> ```

**预期产出**：`specs/001-qshop-core/plan.md`。

**检查要点**：

- 模块划分是否与宪法第 3 条的分层要求兼容
- API 规范是否与课程规格书第 5 节一致（`/api/v1` 前缀、统一响应体、`page/size` 分页）

### 步骤 5：配置项目级 Rules

在项目的 Rules 中写入 QShop 长期规范（创建方式同第 02 讲练习）：

> **Rules 内容示例（可直接复制）：**
>
> ```markdown
> # QShop 项目规则
>
> ## 技术约定
> - 后端：Spring Boot 3.x、JDK 17、MyBatis-Plus、MySQL 8、Redis
> - 包结构：com.qshop.common / config / security / modules.<模块>.{controller|service|mapper|entity|dto}
> - 所有 REST 接口以 /api/v1 开头；统一响应体 Result<T>：{code, message, data}
> - 金额字段用 BigDecimal；时间字段用 LocalDateTime
> - 实体类使用 Lombok @Data；Controller 参数校验用 Jakarta Validation 注解
>
> ## 行为约定
> - 修改代码前先说明改动点和原因
> - 新增依赖前先列出依赖坐标并征得同意
> - 生成的代码必须可通过编译；涉及 SQL 的必须同步提供建表/改表语句
> - 回复使用中文
> ```

**检查要点**：让 AI 复述当前生效的规则，确认 Rules 已被加载。

### 步骤 6：初始化 Spring Boot 工程

> **提示词示例：**
>
> ```
> 请初始化 qshop-server 后端工程：
> - Maven 项目，groupId=com.qshop，artifactId=qshop-server，JDK 17，Spring Boot 3.x
> - 依赖：spring-boot-starter-web、spring-boot-starter-validation、
>   mybatis-plus-spring-boot3-starter、mysql-connector-j、spring-boot-starter-data-redis、
>   spring-boot-starter-security、jjwt（api/impl/jackson）、springdoc-openapi-starter-webmvc-ui、lombok
> - 按宪法建立包结构 common/config/security/modules
> - application.yml 配置 MySQL（数据库名 qshop）、Redis、服务端口 8080、context-path 留空
> 生成后告诉我如何启动验证。
> ```

**预期产出**：完整的 Maven 工程，`QshopApplication` 启动类，按约定组织的包目录。

**验证**：

```powershell
cd qshop-server
mvn spring-boot:run
```

> 注意：此时数据库还没建，启动可能因连不上 MySQL 报错——属于预期内，第 05 讲建库后解决。若你希望现在就跑通，可让 AI 临时注释数据源自动配置。

**检查要点**：

- `pom.xml` 里的依赖版本是否互相兼容（MyBatis-Plus 必须用 boot3 版本）
- 包结构是否严格符合 Rules 约定
- `application.yml` 中**不得出现真实密码硬编码**（用占位符或本地开发配置，后续讲会引入环境变量）

### 步骤 7：建立 Git 仓库

```powershell
cd qshop
git init
```

让 AI 生成 `.gitignore`：

> **提示词示例：**
>
> ```
> 为这个 Maven + Vue 的双目录项目生成 .gitignore，排除 target/、node_modules/、IDE 文件、日志和包含密钥的本地配置。
> ```

首次提交：

```powershell
git add .
git commit -m "chore: 初始化 QShop 项目骨架与 Spec Kit 规格文档"
```

**检查要点**：`git status` 确认 `target/` 等目录没有被纳入跟踪。

### 步骤 8：Git 零基础速通（本课程必备最小知识）

后面每一讲都会提交 Git，这里一次性把必备命令讲透。**Git 一句话理解：代码的「存档系统」——随时存档，随时回读。**

| 命令 | 作用 | 类比 |
| --- | --- | --- |
| `git init` | 初始化仓库 | 给文件夹装上存档功能 |
| `git status` | 看当前改了什么、哪些待提交 | 存档前先看一眼背包 |
| `git add .` | 把改动放入待提交区（暂存区） | 挑选要存档的物品 |
| `git commit -m "说明"` | 真正存档，附带一句说明 | 存档并写存档笔记 |
| `git diff` | 查看具体改了哪几行 | 逐字核对改动 |
| `git log --oneline` | 查看存档历史 | 查看所有存档点 |

**提交粒度原则：一次可验证的改动 = 一次提交**。比如「完成登录接口并测通」是一次提交；不要把三天的工作塞进一个 commit，也不要把改一个标点符号当一次提交。每讲结尾的提交信息可以直接用讲义里给出的模板。

**回滚概念（本阶段只学到这里）**：万一改坏了，`git diff` 先看改了什么；确认要丢弃未提交的改动时可以让 AI 协助你执行对应命令并解释后果。提交过的历史永远可以回读（`git log` 找到存档点），这就是为什么第 02 讲说「保持 Git 提交习惯，随时可回滚」。

## 6. 常见坑与 AI 幻觉识别

1. **依赖坐标幻觉**：AI 可能编造不存在的 artifactId 或版本。验证方法：`mvn dependency:resolve` 能否拉取成功；拉不到就去 Maven 中央仓库搜索确认。
2. **Spring Boot 2 与 3 混淆**：AI 训练数据里 Boot 2 的 `javax.*` 写法极多，生成 Boot 3 代码时可能混入 `javax` 包名——Boot 3 必须是 `jakarta.*`。发现 `javax.servlet`、`javax.validation` 立即要求改正。
3. **宪法被悄悄违反**：AI 可能「顺手」引入一个网关组件或建议拆服务。对照宪法驳回。
4. **配置文件泄密**：检查 `application.yml` 没有真实账号密码；课程中统一用本地开发占位值。

## 7. 课后练习任务

1. 完善 spec.md：补充「订单状态流转」的用户故事（对照课程规格书第 6 节）
2. 让 AI 基于宪法检查一遍 plan.md，输出「一致性检查报告」
3. 给 Rules 增加一条你自己在实战中发现的约定（例如「所有列表接口必须支持分页」）
4. 完成第二次 Git 提交，提交信息说明本次改动内容

## 8. 验收标准清单

- [ ] QShop 宪法、总体规格书、技术方案三份文档齐备且已人工审查
- [ ] 项目 Rules 生效，AI 能复述关键约定
- [ ] `qshop-server` 工程结构符合宪法与 Rules 约定
- [ ] Maven 依赖全部可解析（无幻觉坐标）
- [ ] Git 仓库已建立，`.gitignore` 正确，至少两次提交
- [ ] 能回答：为什么「本期不做」清单和需求本身一样重要

下一讲：[第 05 讲 · 数据库设计](./05-database-design.md)——让 AI 帮你做 ER 建模并生成全部建表语句。

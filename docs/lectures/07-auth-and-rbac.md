# 第 07 讲 · 认证与 RBAC 权限

> 本讲为 QShop 装上大门与门禁：用户注册登录（JWT 令牌）+ 基于角色的访问控制（RBAC）。同时从本讲开始，每个核心模块按 OpenSpec 节奏推进：先提交变更提案（含规格、设计与任务），再逐任务实现，完成后归档。

## 1. 学习目标与本讲地图

学完本讲，你将能够：

- [ ] 解释 JWT 的工作原理（为什么服务器可以「无状态」认出你）
- [ ] 说清 RBAC 模型：用户 → 角色 → 权限三层关系
- [ ] 用 OpenSpec 走一遍「模块级」提案流程
- [ ] 实现注册、登录接口与 JWT 过滤器，并逐层审查安全代码
- [ ] 用注解控制接口权限（普通用户 vs 管理员）

本讲地图：

```
认证原理 → 模块 Spec → 注册登录实现 → JWT 过滤器 → RBAC 权限控制 → 安全审查
```

## 2. 术语表

| 术语 | 一句话理解 |
| --- | --- |
| 认证（Authentication） | 证明「你是谁」——登录 |
| 授权（Authorization） | 判定「你能干什么」——权限 |
| JWT（JSON Web Token） | 一张「签名过的电子门票」，登录成功后发给你，之后每次请求带着它 |
| RBAC | 基于角色的权限模型：权限给角色，角色给用户 |
| Security Filter Chain | Spring Security 的过滤器链：每个请求进来先过一道道安检 |
| BCrypt | 密码哈希算法，加盐且慢，专为存密码设计 |

## 3. 企业级知识点

### 3.1 JWT 为什么能「无状态认证」

**类比**：游乐园手环。入园时验明身份发手环（登录发 JWT），之后玩每个项目只验手环（验签名），不需要每次都回大门查身份证（服务器不用存会话）。

JWT 三段结构：头部.载荷.签名。关键点：

- 载荷里放用户 id、用户名、角色（**不放密码等敏感信息**——JWT 只是签名防篡改，不是加密，内容可被解码查看）
- 签名用服务器密钥生成，伪造不了
- 有过期时间；课程中退出登录的「作废」处理用 Redis 黑名单（简化方案）

### 3.2 RBAC 三层模型

```
用户(user) ──> 角色(role) ──> 权限(permission)
admin        ROLE_ADMIN     product:write, user:manage ...
普通用户      ROLE_USER      product:read
```

新增权限不改代码：给角色挂上权限即可。种子数据已在第 05 讲备好。

## 4. 分步实战

### 步骤 1：模块级提案（OpenSpec 节奏从本讲开始）

> **提示词示例：**
>
> ```
> /opsx:propose 为 QShop 创建「认证与权限」模块变更提案（含规格、设计与任务）：
> 功能需求：
> - 注册：POST /api/v1/auth/register，用户名+密码（Jakarta Validation 校验），用户名唯一校验（错误码 10003），密码 BCrypt 加密存储，注册成功自动赋予 ROLE_USER
> - 登录：POST /api/v1/auth/login，成功返回 JWT（有效期 2 小时）与用户信息 LoginVO；失败统一返回 401（不区分「用户不存在」和「密码错误」）
> - 鉴权：除注册/登录/商品浏览（GET categories、products）与 Swagger 路径外，其余接口需携带 JWT
> - 授权：/api/v1/admin/** 仅管理员可访问；开启 @EnableMethodSecurity，管理接口用 @PreAuthorize 权限注解控制
> - 用户管理：GET /api/v1/admin/users 分页列表（user:manage 权限，VO 不含密码字段）；PUT /api/v1/admin/users/{id}/status 启用/禁用（禁止禁用自己，被禁用用户拒绝登录）
> - 退出：JWT 加入 Redis 黑名单直至自然过期
> 技术约束（写入 design.md）：
> - Spring Security 用 Boot 3 风格 SecurityFilterChain（禁用 WebSecurityConfigurerAdapter/antMatchers 等废弃 API）
> - JwtAuthenticationFilter 注册在 UsernamePasswordAuthenticationFilter 之前；解析 JWT 异常时吞掉并返回 401（统一响应体，同样处理 403）；关闭 CSRF
> - JWT 载荷只含 userId、username、角色码列表，不放敏感信息；密钥从 application.yml 读取；登录时把权限码列表（role_permission 关联查询）放入认证上下文
> - 实现风格参照 modules/category 样板
> ```

**预期产出**：`openspec/changes/add-auth/`（或类似名称），含 proposal.md、design.md、tasks.md 与 delta 规格。

**检查要点**：确认 delta 规格中存在「未登录访问受保护接口返回 401」「无权限返回 403」两条行为要求——这是 AI 最容易漏写的边界。

tasks.md 会随提案一起生成，检查任务拆分是否合理，预期得到类似清单：用户注册 → 登录签发 JWT → JWT 过滤器 → 权限注解接入 → 退出黑名单。

> **实现节奏（OpenSpec 的正统做法）**：需求已经全部锁在提案里，后续实现一律由 tasks.md 驱动（`/opsx:apply`），**实现时不再重复描述需求**——这正是第 03 讲「提案先行」的意义。下面三个步骤分别对应三批任务，每批完成后做针对性审查。

### 步骤 2：实现注册与登录（任务驱动）

> **指令示例：**
>
> ```
> /opsx:apply 按 tasks.md 开始实现，先做注册、登录与 JwtUtil 相关任务（@modules/category 参照样板风格）。一次只做一个任务，验证通过再继续下一个。
> ```

**预期产出**：auth/user 模块代码 + `security/JwtUtil.java`。

**检查要点（安全审查第一遍）**：

- 密码入库前经过 `BCryptPasswordEncoder.encode()`——搜代码确认没有明文落库路径
- 登录失败时错误信息不区分「用户不存在」和「密码错误」（统一 401，防止账号探测）
- JWT 密钥在配置文件中，**不硬编码在 Java 里**

### 步骤 3：实现 Spring Security 与 JWT 过滤器（继续任务驱动）

> **指令示例：**
>
> ```
> /opsx:apply 继续实现 tasks.md 中的 Spring Security 配置与 JWT 过滤器任务。
> ```

这批任务的技术约束已写在提案的 design.md 里（Boot 3 风格、过滤器位置、异常处理、401/403 统一响应、关闭 CSRF），AI 实现时会自行读取；你的工作是对照下面的清单审查产出：

**预期产出**：`config/SecurityConfig.java`、`security/JwtAuthenticationFilter.java`。

**检查要点（安全审查第二遍，重点）**：

| 检查项 | 说明 |
| --- | --- |
| 无 WebSecurityConfigurerAdapter | 该类在 Spring Security 5.7 已废弃，出现即版本幻觉 |
| 放行清单最小化 | 逐条核对放行路径，多放一个都是漏洞 |
| 过滤器异常处理 | 解析 JWT 抛异常时必须吞掉并返回 401，不能让异常穿透成 500 |
| 401/403 响应格式 | 是否走了统一响应体（AuthenticationEntryPoint / AccessDeniedHandler） |

### 步骤 4：实现 RBAC 权限控制（继续任务驱动）

> **指令示例：**
>
> ```
> /opsx:apply 继续实现 tasks.md 中的权限注解与用户管理任务。
> ```

**预期产出**：权限注解生效的管理端接口 + 用户列表与启用/禁用功能。

**验证（完整走一遍权限链路）**：

1. admin/Admin@123 登录 → 拿到 token
2. 带 token 访问 `GET /api/v1/admin/users` → 200
3. 注册一个普通用户登录 → 访问同接口 → 403
4. 不带 token 访问 → 401
5. 修改 JWT 载荷里的角色（用 jwt.io 解码观察结构即可，无需真改）——体会「签名保护」的含义

**检查要点**：

- 用户列表 VO 确认不含 password 字段；启用/禁用接口实测后，被禁用用户无法再登录
- 第 05 讲 admin 密码 BCrypt 密文是否有效就在这一步验证——登录失败就重新生成密文

## 5. 常见坑与 AI 幻觉识别

1. **Boot 3 配 Boot 2 的 Security 写法**：`WebSecurityConfigurerAdapter`、`antMatchers` 都是 Boot 2 时代 API，Boot 3 应为 `SecurityFilterChain` + `requestMatchers`。这是认证模块最高频的幻觉。
2. **JWT 载荷塞敏感信息**：检查载荷里有没有 password、手机号。
3. **过滤器放行过宽**：例如把 `/api/v1/**` 整个放行。对照提案的放行清单逐一核对。
4. **密码比较用 equals**：必须 `passwordEncoder.matches(输入, 密文)`。
5. **权限注解写了但没开启 @EnableMethodSecurity**：注解形同虚设，用「普通用户访问管理接口」实测验证。

## 6. 课后练习任务

1. 实现退出登录接口 `POST /api/v1/auth/logout`：把当前 JWT 加入 Redis 黑名单（key 可用 token 的哈希），验证退出后旧 token 立即失效
2. 给 `GET /api/v1/addresses` 加上「需登录」保护，实测无 token 返回 401
3. 让 AI 解释 JwtAuthenticationFilter 的每一行代码（选中代码提问），直到你能独立讲清整个认证链路
4. 更新提案：把「退出登录」补充进 delta 规格——练习文档先行；模块完成后用 `/opsx:archive` 归档，让主规格沉淀认证能力的行为契约
5. Git 提交：`feat: 认证与 RBAC 权限`

## 7. 验收标准清单

- [ ] 注册、登录接口实测通过，密码以 BCrypt 密文存储
- [ ] 无 token 访问受保护接口返回 401 统一响应；普通用户访问管理接口返回 403
- [ ] 管理员可访问 `/api/v1/admin/users`，权限注解链路实测生效
- [ ] SecurityConfig 无废弃 API，放行清单与 spec 一致
- [ ] JWT 载荷无敏感信息，密钥在配置文件
- [ ] 能完整口述「请求 → 过滤器 → 认证上下文 → 权限注解」链路
- [ ] Git 已提交

下一讲：[第 08 讲 · 商品与分类模块](./08-product-and-category.md)——第一个完整业务模块，体验 AI 批量生成 + 接口文档。

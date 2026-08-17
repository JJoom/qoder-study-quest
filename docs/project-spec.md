# QShop 电商系统 · 项目需求规格书

> 本文档是全课程的「需求真相源」。所有讲义中的表名、字段名、API 路径均以本文档为准。
> 课程中会用 OpenSpec 重新生成这些规格（那是学习过程），本文档提供最终的标准答案供对照。
> **使用姿势（重要）**：先自己做（澄清需求、写提案、做设计），做完再对照本文档查漏补缺。**不要把本文档整段复制进你的提案**——跳过思考就失去了学习意义，而且你后续也无法判断 AI 产出的对错。

## 1. 项目概述

- **项目名**：QShop 电商系统
- **架构风格**：单体架构（前后端分离，但不拆微服务）
- **仓库结构**：单仓库两个目录，`qshop-server`（后端）+ `qshop-web`（前端）

## 2. 技术栈

### 后端

| 技术 | 版本 | 用途 |
| --- | --- | --- |
| Spring Boot | 3.x（JDK 17） | 应用框架 |
| MyBatis-Plus | 3.5.x | ORM 框架 |
| MySQL | 8.x | 关系型数据库 |
| Redis | 6.x+ | 缓存、购物车、JWT 黑名单 |
| Spring Security + JWT | - | 认证与授权 |
| springdoc-openapi | 2.x | 接口文档（Swagger UI） |
| Maven | 3.8+ | 构建工具 |

### 前端

| 技术 | 版本 | 用途 |
| --- | --- | --- |
| Vue | 3.x（Composition API + `<script setup>`） | 前端框架 |
| Vite | 5.x | 构建工具 |
| Pinia | 2.x | 状态管理 |
| Vue Router | 4.x | 路由 |
| Element Plus | 2.x | UI 组件库 |
| Axios | 1.x | HTTP 请求 |

## 3. 功能域

| 功能域 | 角色 | 说明 |
| --- | --- | --- |
| 用户注册登录 | 游客/用户 | 用户名密码注册、登录，JWT 令牌 |
| 商品浏览 | 游客/用户 | 分类导航、商品列表（分页/搜索）、商品详情 |
| 购物车 | 用户 | 加购、改数量、删除、勾选结算，存 Redis |
| 订单 | 用户 | 下单、订单列表、订单详情、取消订单 |
| 收货地址管理 | 用户 | 地址增删改查、设置默认地址 |
| 支付 | 用户 | 模拟支付（无真实渠道），支付后回调改状态 |
| 后台商品管理 | 管理员 | 商品/分类的增删改查、上下架、库存调整 |
| 后台用户管理 | 管理员 | 用户列表、启用/禁用 |
| 权限体系 | 系统 | RBAC：用户-角色-权限 |

## 4. 数据模型（ER 概览）

```
user ──< user_role >── role ──< role_permission >── permission
user ──< address
category ──< product
user ──< order ──< order_item >── product
order ──< payment
```

### 表清单

| 表名 | 说明 |
| --- | --- |
| `user` | 用户表 |
| `role` | 角色表 |
| `permission` | 权限表 |
| `user_role` | 用户-角色关联表 |
| `role_permission` | 角色-权限关联表 |
| `category` | 商品分类表 |
| `product` | 商品表 |
| `address` | 收货地址表 |
| `order` | 订单主表 |
| `order_item` | 订单明细表 |
| `payment` | 支付记录表 |

### 核心字段约定

- 所有表主键 `id BIGINT` 自增（雪花 ID 亦可，课程采用自增简化）
- 所有表含 `created_at DATETIME`、`updated_at DATETIME`
- 逻辑删除字段统一命名 `deleted TINYINT`（0 正常 / 1 删除），仅 `user`、`product`、`category` 使用
- `user` 表含 `status VARCHAR` 字段（ENABLED 启用 / DISABLED 禁用），供后台用户管理启用/禁用
- 金额一律用 `DECIMAL(10,2)`，禁止用浮点类型
- 订单号 `order_no` 格式：`yyyyMMddHHmmss + 6 位随机数`；支付单号 `payment_no` 同理前缀 `P`

> 完整 DDL 在第 05 讲由 AI 生成并审查，本节只锁定命名与关键约定。

## 5. API 规范

### 5.1 路径规范

- 统一前缀：`/api/v1`
- 资源名用复数小写：`/api/v1/products`、`/api/v1/orders`
- 后台管理接口加 `/admin` 段：`/api/v1/admin/products`

### 5.2 统一响应体

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 5.3 错误码表

| code | 含义 |
| --- | --- |
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未登录 / 令牌无效 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 业务冲突（如库存不足、重复下单） |
| 500 | 服务器内部错误 |

业务细分错误码从 `10001` 起，如 `10001` 库存不足、`10002` 订单状态不允许该操作、`10003` 用户名已存在。

### 5.4 分页规范

- 请求参数：`page`（从 1 开始）、`size`（默认 10）
- 响应 data 结构：`{ "records": [], "total": 0, "page": 1, "size": 10 }`

## 6. 订单状态机

```
待支付(UNPAID) ──支付成功──> 已支付(PAID) ──（课程范围内不实现发货）
待支付(UNPAID) ──超时/用户取消──> 已取消(CANCELLED)
已支付(PAID)  ──用户申请退款（课程范围内仅改状态）──> 已退款(REFUNDED)
```

> 范围说明：「超时自动取消」属于定时任务范畴，本期不实现；第 10 讲以设计文档形式演练该方案。

## 7. 后端目录结构约定

```
qshop-server/
└── src/main/java/com/qshop/
    ├── QshopApplication.java
    ├── common/              # 通用层：Result、错误码、全局异常、工具类
    ├── config/              # 配置类：MyBatis-Plus、Redis、Security、OpenAPI
    ├── security/            # JWT 过滤器、认证逻辑
    └── modules/             # 业务模块（每个模块内部 controller/service/mapper/entity/dto）
        ├── user/
        ├── auth/
        ├── category/
        ├── product/
        ├── cart/
        ├── order/
        └── payment/
```

## 8. 前端目录结构约定

```
qshop-web/
└── src/
    ├── api/                 # 按模块拆分的接口请求函数
    ├── components/          # 通用组件
    ├── layouts/             # 布局组件（前台布局、后台布局）
    ├── router/              # 路由定义与守卫
    ├── stores/              # Pinia 状态（user、cart）
    ├── utils/               # request 封装等工具
    └── views/               # 页面（home/ product/ cart/ order/ admin/ auth/）
```

## 9. 非功能性要求

- 所有接口必须有参数校验（后端用 Jakarta Validation 注解）
- 密码必须加密存储（BCrypt），任何日志不得打印密码与令牌
- 下单扣库存必须防超卖（第 10 讲：乐观锁实现）
- 商品详情等热点数据使用 Redis 缓存（第 15 讲）
- 接口文档可通过 Swagger UI 访问（仅开发环境开放）

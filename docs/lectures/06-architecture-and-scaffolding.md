# 第 06 讲 · 分层架构与工程脚手架

> 本讲搭建 QShop 后端的「工程底座」：分层结构、统一响应体、全局异常处理、MyBatis-Plus 集成。更重要的是学会一个核心技巧——**先让 AI 做一个「标准样板」，之后所有模块照样板生成**，这是让 AI 持续产出一致代码的关键。

## 1. 学习目标与本讲地图

学完本讲，你将能够：

- [ ] 说清 Controller / Service / Mapper 三层各自的职责
- [ ] 实现统一响应体 Result 与业务错误码体系
- [ ] 实现全局异常处理器，让所有错误返回统一格式
- [ ] 配置 MyBatis-Plus（分页插件、逻辑删除、自动填充时间字段）
- [ ] 用「样板先行」策略让 AI 生成后续一致的模块代码

本讲地图：

```
分层原理 → 通用层（Result/异常/错误码）→ MyBatis-Plus 配置 → 样板模块 → 验证
```

## 2. 术语表

| 术语 | 一句话理解 |
| --- | --- |
| 分层架构 | 把代码按职责分层：接口层、业务层、数据层，各管一段 |
| Controller | 接口层：接收 HTTP 请求、校验参数、返回响应，不写业务逻辑 |
| Service | 业务层：写业务规则（如「库存不足不能下单」），是代码的核心 |
| Mapper（DAO） | 数据层：只负责和数据库打交道 |
| DTO | 接口出入参对象，与数据库实体（Entity）分离 |
| 全局异常处理 | 集中捕获所有异常并转成统一响应，避免每个接口重复写 try-catch |
| HTTP 状态码 | 服务器回复的「结果标签」：2xx 成功；4xx 客户端问题（401 未登录、403 无权限、404 不存在、400 参数错）；5xx 服务端自己出了问题 |
| 样板（Reference Implementation） | 一个标准的参考实现，后续同类代码照着它生成 |

## 3. 企业级知识点：为什么要分层

想象餐厅：服务员（Controller）点单，厨师（Service）做菜，采购员（Mapper）管仓库。服务员不下厨、厨师不直接对接客人，出了问题才知道去哪一层找。

分层的实际收益：

1. **可测**：Service 不依赖 HTTP，可以单独写单元测试（第 14 讲）
2. **可换**：换 ORM 框架只动 Mapper 层
3. **AI 友好**：一次只让 AI 写一层，范围小、好审查

## 4. 分步实战

### 步骤 1：实现统一响应体与错误码

> **提示词示例：**
>
> ```
> @.qoder/rules 请在 common 包实现统一响应基础设施：
> 1. Result<T>：字段 code、message、data；静态方法 success(data)、fail(code, message)
> 2. ErrorCode 枚举：实现课程错误码表（200/400/401/403/404/409/500），
>    并预留业务错误码 10001 库存不足、10002 订单状态不允许该操作、10003 用户名已存在
> 3. BusinessException：携带 ErrorCode 的业务异常类
> 先给我看代码设计思路，我确认后再写。
> ```

**预期产出**：`common/Result.java`、`common/ErrorCode.java`、`common/BusinessException.java`。

**检查要点**：

- Result 的泛型使用是否正确（`Result<ProductVO>` 这种用法能否编译）
- 错误码数值与课程规格书第 5.3 节完全一致

### 步骤 2：全局异常处理器

> **提示词示例：**
>
> ```
> 请实现全局异常处理器 GlobalExceptionHandler（@RestControllerAdvice）：
> 1. BusinessException → 返回其携带的 code 与 message
> 2. 参数校验异常（MethodArgumentNotValidException）→ 400 + 第一条校验错误信息
> 3. 其他未知异常 → 500 + "服务器内部错误"，并记录日志
> 注意：未知异常的日志要打印完整堆栈，但响应体里不能暴露堆栈细节。
> ```

**预期产出**：`common/GlobalExceptionHandler.java`。

**检查要点**：

- 未知异常的响应 message 是否为固定文案（不能把 `e.getMessage()` 直接返回给前端——可能泄露 SQL 细节）
- 日志用的是 `log.error("...", e)` 而不是 `e.printStackTrace()`

### 步骤 3：MyBatis-Plus 配置

> **提示词示例：**
>
> ```
> 请配置 MyBatis-Plus：
> 1. 分页插件 PaginationInnerInterceptor（MySQL 方言）
> 2. 逻辑删除：字段 deleted，值 1 表示删除（application.yml 或注解方式）
> 3. MetaObjectHandler 自动填充：insert 时填 created_at/updated_at，update 时填 updated_at
> 实体基类 BaseEntity 包含 id、createdAt、updatedAt，供各实体继承。
> ```

**预期产出**：`config/MybatisPlusConfig.java`、`common/BaseEntity.java`。

**检查要点**：

- 分页插件版本 API 与 MyBatis-Plus 3.5.x 匹配（老版本写法 `PaginationInterceptor` 已废弃——典型的新旧版本幻觉）
- 实体字段驼峰与表字段下划线的映射已配置（`map-underscore-to-camel-case: true`）

### 步骤 4：制作「样板模块」——本讲核心技巧

**为什么要样板**：你之后有 7 个业务模块要生成。如果每次都口头描述规范，AI 的产出必然五花八门。正确做法：**精心打磨一个标准模块，后续生成时 @ 引用它作为样板**。

以「分类（category）」这个最简单的模块做样板：

> **提示词示例：**
>
> ```
> @db/schema.sql 请实现分类模块作为全项目的标准样板：
> - entity/Category：继承 BaseEntity，对应 category 表
> - mapper/CategoryMapper：继承 BaseMapper<Category>
> - service/CategoryService + impl/CategoryServiceImpl
> - controller/CategoryController：仅实现"查询全部有效分类"接口 GET /api/v1/categories
> - DTO/VO 与 Entity 分离
> 要求：这是样板代码，注释要详细解释每一层的职责边界。
> ```

**预期产出**：`modules/category/` 下完整的一套分层代码。

**审查样板的标准（这是你全项目最该认真的一次审查）**：

| 检查项 | 标准 |
| --- | --- |
| Controller | 没有业务逻辑，只有参数校验 + 调 Service + 包 Result |
| Service | 接口 + 实现类分离；事务注解用在实现类 |
| Mapper | 只继承 BaseMapper，无业务方法 |
| 命名 | 包名、类名严格符合 Rules 约定 |
| 校验 | 入参 DTO 上有 Jakarta Validation 注解 |

样板不合格就继续改，**直到它配得上当全项目的模板**。然后把样板约定追加进 Rules：

> **Rules 追加示例：**
>
> ```
> - 新增业务模块必须参照 modules/category 的代码结构与风格
> ```

### 补充：你的第一个 HTTP 调试工具

从这里开始要频繁「调用接口验证」，先把工具准备好（后续各讲不再重复教）：

- **GET 接口（不带登录态的）**：浏览器地址栏直接输 URL 就行，零安装——比如本讲要验证的分类列表
- **POST 接口、带 token 的接口**（第 07 讲起大量出现）：需要 Apifox（apifox.com，中文免费）或 Postman。最小用法三步：
  1. 新建请求，选方法（如 POST）、填 URL、在 Body 里填 JSON 入参
  2. 发送后在响应里找到 token 字段，复制
  3. 后续请求在 Headers 里加一行：`Authorization: Bearer 粘贴的token`

### 步骤 5：启动验证

启动应用，用任意 HTTP 工具（浏览器也可）访问：

```
GET http://localhost:8080/api/v1/categories
```

**预期产出**：

```json
{"code":200,"message":"success","data":[...种子数据中的分类...]}
```

再制造一次业务异常验证全局处理：临时让 AI 加一个测试接口抛出 `BusinessException(ErrorCode.USERNAME_EXISTS)`，确认返回：

```json
{"code":10003,"message":"用户名已存在","data":null}
```

验证完删除测试接口。

## 5. 常见坑与 AI 幻觉识别

1. **Controller 里写业务逻辑**：AI 图省事把查询逻辑直接写在 Controller。发现就要求下沉到 Service——这是分层纪律，不能破。
2. **MyBatis-Plus 新旧 API 混用**：看到 `PaginationInterceptor`、`@TableField(fill=...)` 配错字段名，都是版本幻觉信号。
3. **Entity 直接当接口出参**：会把 password、deleted 等字段暴露给前端。检查所有接口返回是否用了 VO/DTO。
4. **异常处理器吞异常**：catch 之后既不记日志也不上抛。检查每个 catch 分支都有日志或合理响应。

## 6. 课后练习任务

1. 用同样的套路让 AI 生成「地址（address）」模块的查询接口 `GET /api/v1/addresses`（需登录的接口暂时不加鉴权，第 07 讲补）——检验样板的复制效果
2. 对比 AI 生成的 address 模块与 category 样板，找出所有风格不一致的地方，思考：是 Rules 没写到位，还是提示词没给样板引用？
3. 让 AI 画一张本讲代码的调用时序图（请求 → Controller → Service → Mapper → DB），确认你能讲清每一跳
4. Git 提交：`feat: 通用层与分类样板模块`

## 7. 验收标准清单

- [ ] 应用启动成功，`/api/v1/categories` 返回统一响应体格式
- [ ] 业务异常与参数校验异常均返回规范的错误码响应
- [ ] 样板模块通过全部 5 项审查标准
- [ ] Rules 已追加「参照样板模块」条款
- [ ] 能说出三层架构各自的职责，以及为什么 Entity 不能直接返回给前端
- [ ] Git 已提交本讲代码

下一讲：[第 07 讲 · 认证与 RBAC 权限](./07-auth-and-rbac.md)——为系统装上大门：JWT 登录与角色权限体系。

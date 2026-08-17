# 第 08 讲 · 商品与分类模块

> 本讲实现第一个完整业务模块：商品的 C 端浏览 + 管理端 CRUD、分类管理、文件上传与接口文档。你将体验「AI 批量生成一个完整模块」的流程与审查方法。

## 1. 学习目标与本讲地图

学完本讲，你将能够：

- [ ] 用 OpenSpec 完成商品模块的提案与任务拆分
- [ ] 让 AI 一次性生成模块级代码（entity 到 controller 全套）并系统审查
- [ ] 实现 MyBatis-Plus 分页查询与条件搜索
- [ ] 实现图片上传（本地存储）与静态资源访问
- [ ] 通过 Swagger UI 查看并调试接口

本讲地图：

```
模块 Spec → C 端接口（列表/详情）→ 管理端 CRUD → 文件上传 → 接口文档
```

## 2. 术语表

| 术语 | 一句话理解 |
| --- | --- |
| CRUD | 增（Create）删（Delete）改（Update）查（Read），后台管理的基本盘 |
| 分页查询 | 数据多时一页只返回一部分，带总数与页码 |
| VO/DTO | VO 是「返回给前端看的对象」，DTO 是「前端提交进来的对象」 |
| OpenAPI / Swagger | 接口文档标准 + 可视化调试页面 |
| 上下架 | 商品的销售状态：上架（可购买）/ 下架（隐藏） |

## 3. 分步实战

### 步骤 1：模块提案与任务拆分

> **提示词示例：**
>
> ```
> /opsx:propose 为 QShop 创建「商品与分类」模块变更提案（含规格、设计与任务）：
> C 端：按分类浏览商品列表（分页+关键字搜索）、商品详情（含库存与销量，游客可看）
> 管理端：分类 CRUD、商品 CRUD（名称/分类/价格/库存/主图/详情描述）、上架下架
> 约束：删除均为逻辑删除；商品列表不返回下架商品；管理端操作需 product:write / category:write 权限
> ```

提案生成后检查 tasks.md 的任务拆分。

**检查要点**：确认 delta 规格写明「C 端列表过滤下架商品」——这是 C 端/管理端数据可见性差异的典型边界。

### 步骤 2：C 端接口

> **提示词示例：**
>
> ```
> @openspec/changes（引用商品变更目录的提案与 delta 规格）@modules/category @db/schema.sql
> 实现商品模块 C 端部分，参照 category 样板风格：
> 1. GET /api/v1/products：分页查询，参数 page/size/categoryId/keyword，
>    只返回上架(status=ON_SALE)且未删除的商品，按 created_at 倒序
> 2. GET /api/v1/products/{id}：商品详情，商品不存在或已下架返回 404
> 3. ProductVO 只包含前端需要的字段
> 分页返回结构遵循项目规范：{records, total, page, size}
> ```

**预期产出**：`modules/product/` 全套分层代码。

**验证**：用 HTTP 工具访问 `GET /api/v1/products?page=1&size=3`，确认返回种子商品且结构符合规范。

**检查要点**：

- 分页参数是否走了 MyBatis-Plus 的 `Page<T>`，而不是自己 limit 拼 SQL
- keyword 搜索是否用了参数绑定（`LIKE CONCAT('%', #{keyword}, '%')`），**绝不能字符串拼接 SQL**（注入风险）

### 步骤 3：管理端 CRUD

> **提示词示例：**
>
> ```
> 继续实现商品管理端（/api/v1/admin/products），权限注解 @PreAuthorize("hasAuthority('product:write')")：
> 1. POST 新增：校验名称非空、价格>0、库存>=0、分类存在
> 2. PUT /{id} 修改：同上校验，商品不存在返回 404
> 3. PUT /{id}/status 上下架：入参 ON_SALE/OFF_SALE
> 4. DELETE /{id} 逻辑删除
> 5. GET 管理端列表：可见所有状态商品，支持按状态筛选
> 同时为分类模块补齐管理端 CRUD（category:write 权限）。
> ```

**预期产出**：管理端接口全套。

**验证**：用管理员 token 走一遍增删改查；用普通用户 token 调用，确认 403。

**检查要点**：

- 修改接口是否先查再改（防止更新不存在记录时 affected rows=0 却返回成功）
- 价格字段全链路 BigDecimal，搜索代码确认没有 double

### 步骤 4：文件上传（商品主图）

> **提示词示例：**
>
> ```
> 实现商品主图上传：
> 1. POST /api/v1/admin/upload（需登录），接收 MultipartFile
> 2. 校验：只允许 jpg/png/webp，大小不超过 2MB，用文件名后缀白名单判断
> 3. 存储到本地 upload/ 目录，文件名用 UUID 重命名防覆盖，配置静态资源映射使其可通过 /files/** 访问
> 4. 返回可访问的 URL
> ```

**预期产出**：上传接口 + WebMvc 静态资源配置。

**验证**：上传一张图片 → 用返回的 URL 在浏览器打开 → 把该 URL 填入某商品的 mainImage 并在列表接口确认。

**检查要点（安全）**：

- 文件类型校验基于内容或后缀白名单，**不能只看前端传的字段**
- 存储文件名是 UUID 而非原始文件名（防止路径穿越如 `../../`）

### 步骤 5：接口文档（springdoc）

> **提示词示例：**
>
> ```
> 为项目配置 springdoc-openapi：
> 1. 开启 Swagger UI（springdoc 默认访问地址是 /swagger-ui/index.html，可用 springdoc.swagger-ui.path 自定义），仅 dev profile 开启
> 2. 给商品与分类的 Controller/DTO 补充 @Tag、@Operation、@Schema 注解
> 3. SecurityConfig 放行 Swagger 相关路径（仅 dev）
> ```

**验证**：浏览器打开 Swagger UI（默认 `http://localhost:8080/swagger-ui/index.html`，若 AI 配置了自定义路径则以它为准），能看到分组接口，并在页面上直接调用「商品列表」接口成功。

**检查要点**：生产环境必须禁用文档——确认配置用 profile 控制。

## 4. 常见坑与 AI 幻觉识别

1. **批量生成的「一致性衰减」**：一次生成代码越多，越容易在某处偏离样板（比如某个 Service 忘了写接口）。生成后立即与样板逐文件对比结构。
2. **LIKE 注入**：keyword 直接拼进 SQL 是高危错误，重点检查 Mapper 层。
3. **逻辑删除失效**：查询没走 MyBatis-Plus（自己写 SQL）时会绕过 deleted 过滤，检查自定义 SQL 是否带了 `deleted = 0`。
4. **上传目录进 Git**：确认 `.gitignore` 已排除 upload/ 目录。
5. **springdoc 与 Boot 版本不匹配**：Boot 3 必须用 springdoc 2.x（`springdoc-openapi-starter-webmvc-ui`），1.x 是 Boot 2 的。

## 5. 课后练习任务

1. 给商品列表增加排序参数 `sort`（支持 price_asc / price_desc / sales_desc）
2. 实现「按分类查询」时分类不存在的 404 处理
3. 在 Swagger 上完成一次完整的「上传图片 → 创建商品 → 列表可见」流程演示
4. 让 AI 审查本模块代码的安全性（注入、越权、文件上传），记录它发现的问题与你复核的结论
5. Git 提交：`feat: 商品与分类模块`

## 6. 验收标准清单

- [ ] C 端列表/详情接口实测通过，下架商品不出现
- [ ] 管理端 CRUD 实测通过，普通用户调用返回 403
- [ ] 图片上传成功且通过 URL 可访问，非法类型被拒绝
- [ ] Swagger UI 可访问且能在线调通接口
- [ ] Mapper 层无 SQL 拼接，价格全链路 BigDecimal
- [ ] Git 已提交

下一讲：[第 09 讲 · 购物车与订单](./09-cart-and-order.md)——电商的核心交易链路。

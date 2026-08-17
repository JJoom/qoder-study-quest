# 第 05 讲 · 数据库设计

> 数据库是电商系统的地基。本讲用 AI 完成 QShop 的 ER 建模与全部建表语句，并学会如何审查 AI 给出的表结构。

## 1. 学习目标与本讲地图

学完本讲，你将能够：

- [ ] 说清 ER 建模的基本思路：从业务名词到表
- [ ] 让 AI 生成 QShop 全部 11 张表的 DDL 并逐表审查
- [ ] 理解索引设计的三个基本原则
- [ ] 在 MySQL 中执行 DDL 并验证表结构
- [ ] 生成种子数据（管理员账号、角色权限、示例商品）

本讲地图：

```
ER 建模思路 → 生成 DDL → 逐表审查 → 索引设计 → 执行建库 → 种子数据
```

## 2. 术语表

| 术语 | 一句话理解 |
| --- | --- |
| ER 模型 | 实体-关系图：有哪些「东西」（实体）、它们之间什么关系 |
| DDL | 建表语句（CREATE TABLE 等），定义数据库结构 |
| 外键关系（逻辑） | 表与表之间通过 id 关联；课程中只在逻辑上维护，不建物理外键 |
| 索引 | 给表建的「目录」，加速查询，但写入略变慢 |
| 逻辑删除 | 不真删数据，用 deleted 字段标记，企业项目标配 |
| 种子数据 | 系统运行所必需的初始数据（管理员账号、基础分类等） |

## 3. 企业级知识点：数据库设计三原则

1. **先建模后建表**：先画出实体和关系，再落 DDL。跳过建模直接让 AI「帮我建个电商库」，得到的表结构往往缺胳膊少腿。
2. **冗余要有意识**：订单明细里冗余存下单时的商品名/价格（快照），是刻意为之——商品信息变了，历史订单不能跟着变。
3. **物理外键慎用**：企业项目普遍用「逻辑外键」（只存关联 id，不建 FOREIGN KEY 约束），便于数据迁移与扩展，一致性由应用层保证。

## 4. 分步实战

### 步骤 1：让 AI 输出 ER 模型

> **提示词示例：**
>
> ```
> @openspec/project.md @openspec/changes（找到 add-qshop-core 变更目录，引用其 proposal.md 与 design.md）
> 请根据 QShop 的提案与设计做数据库建模：
> 1. 列出所有实体及关系（用户、角色、权限、分类、商品、地址、订单、订单明细、支付）
> 2. 说明哪些是多对多关系、如何用中间表表达
> 3. 说明订单为什么需要冗余商品快照
> 只输出模型分析，先不要写建表语句。
> ```

**预期产出**：实体关系分析，应与课程规格书第 4 节一致：

```
user ──< user_role >── role ──< role_permission >── permission
user ──< address
category ──< product
user ──< order ──< order_item >── product
order ──< payment
```

**检查要点**：

- 用户-角色、角色-权限两组多对多关系是否都用了中间表
- order_item 是否冗余了商品名称、图片、下单时单价

### 步骤 2：生成建表 DDL

> **提示词示例：**
>
> ```
> 请按上面的模型生成 MySQL 8 建表语句，遵循以下约定：
> - 库名 qshop，字符集 utf8mb4，引擎 InnoDB
> - 主键 id BIGINT 自增；所有表含 created_at、updated_at
> - user/product/category 三张表加 deleted TINYINT 逻辑删除字段
> - user 表含 status VARCHAR(16) 字段（ENABLED 启用 / DISABLED 禁用，默认 ENABLED），供后台启用/禁用用户
> - 金额一律 DECIMAL(10,2)；订单状态、支付状态用 VARCHAR 存英文枚举值
> - order_no、payment_no 加唯一索引
> - 不建物理外键，只建必要索引
> - 输出完整可执行脚本，包含 CREATE DATABASE
> ```

**预期产出**：一份完整 SQL 脚本（约 11 张表 + 少量索引）。将其保存为 `qshop-server/src/main/resources/db/schema.sql`。

### 步骤 3：逐表审查（本讲核心技能）

对照下面的检查清单逐表过一遍——这是审查 AI 数据库设计的通用清单：

| 检查项 | 说明 |
| --- | --- |
| 金额字段类型 | 必须是 DECIMAL，出现 DOUBLE/FLOAT 立即驳回 |
| 状态字段 | 应为 VARCHAR 存枚举值（UNPAID/PAID…），不要用含义模糊的 0/1/2；user.status 应为 ENABLED/DISABLED |
| 唯一约束 | username、order_no、payment_no 是否加了 UNIQUE |
| 时间字段 | created_at/updated_at 是否齐全；有无默认值 |
| 索引合理性 | 外键 id（order 表的 user_id、product 表的 category_id）是否有索引 |
| 快照字段 | order_item 是否冗余了商品名、单价、图片 |
| 字符集 | 库表是否 utf8mb4（要存 emoji 和生僻字） |

**审查用提示词（让 AI 自查）**：

> ```
> 请以资深 DBA 身份审查这份 schema.sql：
> 1. 指出任何违反"金额用 DECIMAL、状态用 VARCHAR 枚举、订单号唯一"约定的地方
> 2. 指出缺失的索引
> 3. 指出未来数据量大时最先出问题的表
> ```

**检查要点**：AI 的自查结论也要人工复核——它可能「报喜不报忧」。

### 步骤 4：理解索引设计三原则

让 AI 解释它为什么这样建索引，并对照三原则判断：

1. **高频查询条件建索引**：按分类查商品 → `product.category_id`；按用户查订单 → `order.user_id`
2. **唯一性约束即索引**：`username`、`order_no` 加 UNIQUE 的同时天然获得索引
3. **索引不是越多越好**：每次写入都要维护所有索引，低选择度字段（如性别、status）一般不单独建索引

### 步骤 5：执行建库

**先选一种操作数据库的方式**（未安装 MySQL 先看[环境准备手册](../environment-setup.md)第 7 节）：

- **命令行**（下面演示的方式）：不装额外工具，但看数据不直观
- **图形客户端**（新手推荐）：DBeaver（免费）或 Navicat，新建连接（host=localhost、端口 3306、用户 root、密码是你安装时设的）后，用「打开 SQL 文件 → 全部执行」导入 schema.sql，后面看表结构、查数据都方便得多

命令行方式执行建库脚本：

```powershell
cd qshop-server\src\main\resources\db
Get-Content schema.sql -Encoding UTF8 | mysql -u root -p --default-character-set=utf8mb4
```

> 注意：PowerShell 不支持 `<` 重定向符，网上的 `mysql -u root -p < xxx.sql` 写法直接抄会报错，要用上面 `Get-Content | mysql` 的管道写法。

验证：

```sql
USE qshop;
SHOW TABLES;
DESC `order`;
```

> 提示：`order` 是 SQL 关键字，脚本中表名应加反引号。如果 AI 生成的脚本没加导致报错，把完整报错贴给它修复——这是第 01 讲「报错是最好的提示词素材」原则的实际应用。

### 步骤 6：生成种子数据

> **提示词示例：**
>
> ```
> 请生成种子数据 SQL（seed.sql）：
> 1. 角色：ROLE_ADMIN（管理员）、ROLE_USER（普通用户）
> 2. 权限：product:read、product:write、category:write、user:manage
> 3. 角色-权限关联：管理员拥有全部权限，普通用户仅 product:read
> 4. 管理员账号 admin，密码使用 BCrypt 加密后的值（明文 Admin@123，请在注释中说明）
> 5. 三个商品分类、六个示例商品（价格库存合理）
> ```

**预期产出**：`db/seed.sql`。

**检查要点（重要安全项）**：

- 密码必须是 BCrypt 密文（以 `$2a$` 开头的长字符串），**绝不能是明文**
- 你可以自己生成密文：让 AI 写一个临时 Java 工具类调用 `BCryptPasswordEncoder` 输出密文，或直接用 AI 提供的值并在第 07 讲登录时验证
- 种子数据中的 admin 密码只用于本地教学环境，真实项目严禁默认弱密码上线

执行种子数据后，用 SQL 抽查：

```sql
SELECT u.username, r.code FROM user u
JOIN user_role ur ON u.id = ur.user_id
JOIN role r ON ur.role_id = r.id;
```

## 5. 常见坑与 AI 幻觉识别

1. **字段凭空多/漏**：对照规格书的功能域检查——例如购物车在本课程用 Redis 存储，如果 AI 建了 cart_item 表，问它为什么；课程范围内驳回。
2. **枚举用数字码**：`status TINYINT COMMENT '1待支付 2已支付'` 这类设计可读性差，要求改为 VARCHAR 英文枚举。
3. **BCrypt 密文幻觉**：AI 可能「编造」一个看似合法的 BCrypt 字符串，实际与明文不匹配。验证方法：第 07 讲登录功能做完后用 admin/Admin@123 实测；不匹配就重新生成。
4. **utf8 vs utf8mb4**：MySQL 的 `utf8` 是残缺编码（不支持 emoji），必须检查为 `utf8mb4`。

## 6. 课后练习任务

1. 给商品表增加「销量」字段（sales），并让 AI 说明要不要建索引、为什么
2. 假设要支持「一个商品属于多个分类」，让 AI 给出改造方案（只改模型分析，不动表）——体会模型先行的思路
3. 让 AI 以 DBA 视角评估：订单表一年 500 万条数据时，当前设计哪里需要调整？记录要点（答案方向：归档、索引精简，课程不展开）
4. 提交 Git：`feat: 数据库结构与种子数据`

## 7. 验收标准清单

- [ ] 11 张表全部创建成功，`SHOW TABLES` 结果与课程规格书表清单一致
- [ ] 逐表审查清单全部通过（金额/状态/唯一约束/索引/字符集）
- [ ] 种子数据执行成功，admin 用户与角色权限关联查询正确
- [ ] 能说出索引设计三原则，并解释为什么 status 字段不单独建索引
- [ ] 能解释 order_item 冗余商品快照的原因
- [ ] Git 已提交 schema.sql 与 seed.sql

下一讲：[第 06 讲 · 分层架构与工程脚手架](./06-architecture-and-scaffolding.md)——搭建让 AI 持续产出一致代码的工程底座。

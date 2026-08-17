# 附录 · 环境准备手册（Windows 新手版）

> 本附录覆盖课程需要的全部软件。不必一次装完——按「何时用到」列的节奏来即可：第 1-3 讲只需 Qoder、Python、Node.js；其余可以在对应讲次开始前再装。
> 所有验证命令都在 Qoder 的终端里执行（终端怎么用见第 01 讲）。

## 0. 安装前的两个常识

1. **装完软件要重开终端**：安装程序会把命令加进系统 PATH（可以理解为「命令登记簿」），已经打开的终端不会自动刷新，所以装完后关掉终端重新开一个再验证。
2. **验证失败先看 PATH**：提示「不是内部或外部命令 / CommandNotFoundException」，九成是没重开终端或没勾「加入 PATH」选项。

## 1. Qoder（第 01 讲起）

- 下载：访问 Qoder 官网（qoder.com），下载 Windows 版安装包
- 安装：一路下一步即可，安装完从开始菜单启动
- 首次启动会要求登录账号，按引导完成即可
- 验证：能看到主界面，右侧有 AI 对话面板

## 2. Python 3.11+（第 01 讲练习、第 03 讲演练）

- 下载：python.org → Downloads → Windows installer（64-bit）
- 安装要点：**勾选 "Add python.exe to PATH"**（安装第一屏底部的复选框，非常重要）
- 验证：

```powershell
python --version
# 预期输出形如 Python 3.11.x
```

- 常见现象：输入 `python` 弹出微软商店——说明没装 Python 或没加入 PATH，按上面重装并勾选 PATH

## 3. Node.js 20.19+（第 03 讲 OpenSpec、第 11 讲前端）

- 下载：nodejs.org → 选 LTS 版本（需 ≥ 20.19，若 LTS 版本号不够就选 Current）
- 安装：一路下一步（自带 npm）
- 验证：

```powershell
node -v    # 预期 v20.19.0 或更高
npm -v     # 预期 10.x 或更高
```

## 4. JDK 17（第 04 讲起，后端开发）

推荐两种发行版任选其一：

- Microsoft Build of OpenJDK：learn.microsoft.com 搜索 "Microsoft Build of OpenJDK"，下载 JDK 17 的 Windows x64 msi 安装包
- Eclipse Temurin：adoptium.net → Temurin 17（LTS）→ Windows x64 .msi

安装要点：msi 安装器选择默认组件即可（会自动配置 JAVA_HOME 和 PATH）。

验证：

```powershell
java -version
# 预期输出包含 openjdk version "17.x"
```

常见报错：显示的版本不是 17——说明机器上有多个 JDK，让 AI 帮你检查 JAVA_HOME 指向。

## 5. Maven 3.8+（第 04 讲起，项目构建）

- 下载：maven.apache.org → Download → Binary zip archive
- 安装（zip 版需要手动配置）：
  1. 解压到一个无中文无空格的目录，例如 `D:\tools\apache-maven-3.9.x`
  2. 右键「此电脑」→ 属性 → 高级系统设置 → 环境变量：新建系统变量 `MAVEN_HOME` 指向解压目录；编辑 `Path`，新增 `%MAVEN_HOME%\bin`
  3. 重开终端验证
- 验证：

```powershell
mvn -v
# 预期输出包含 Apache Maven 3.x 与 Java version: 17
```

> 提示：mvn -v 显示的 Java 版本必须是 17，否则 Maven 会用错 JDK。

## 6. Git（第 04 讲起，版本管理）

- 下载：git-scm.com → Download for Windows
- 安装：一路下一步，全部默认即可
- 验证：

```powershell
git --version
```

## 7. MySQL 8（第 05 讲起，数据库）

- 下载：dev.mysql.com → MySQL Community Server → Windows x86_64 MSI Installer（选体积大的完整包）
- 安装要点：
  1. 配置类型选 Server only 或 Full 均可
  2. **设置 root 密码那一屏：把密码记在密码管理器或笔记里，忘了很麻烦**（课程用本地开发环境，简单密码即可，如 `Root@1234`）
  3. Windows Service 名称保持默认（MySQL80），安装完自动以服务方式运行
- 验证：

```powershell
mysql -u root -p
# 输入密码后进入 mysql> 提示符，执行 SELECT VERSION(); 看到 8.x 即成功，exit 退出
```

常见报错：`mysql` 命令找不到——MySQL 安装目录的 bin 没进 PATH，把 `C:\Program Files\MySQL\MySQL Server 8.0\bin` 加入 Path 后重开终端。

## 8. Redis（第 09 讲起，可推迟到第 09 讲前再装）

Redis 官方不提供 Windows 版，两种常用方式任选：

**方式 A：Docker（推荐，顺便为第 16 讲铺路）**

1. 安装 Docker Desktop（docker.com，需要开启 WSL2，安装器会引导）
2. 启动 Docker Desktop 后执行：

```powershell
docker run -d --name qshop-redis -p 6379:6379 redis:7
```

**方式 B：Memurai（Windows 原生 Redis 兼容实现）**

- memurai.com 下载 Developer 免费版，一路下一步安装，自动以服务运行

验证（两种方式通用，redis-cli 随 Docker 方式可用 `docker exec -it qshop-redis redis-cli ping`）：

```powershell
redis-cli ping
# 预期输出 PONG
```

## 9. 数据库图形客户端（第 05 讲起，可选但强烈推荐）

命令行能完成一切，但图形客户端看表结构和数据直观得多：

- DBeaver Community（免费，dbeaver.io）或 Navicat（商业，有试用）
- 安装后新建 MySQL 连接，参数：

| 参数 | 值 |
| --- | --- |
| 主机 | localhost |
| 端口 | 3306 |
| 用户名 | root |
| 密码 | 你安装时设置的 |
| 数据库 | qshop（第 05 讲建库后才有） |

## 10. HTTP 接口调试工具（第 06 讲起，可选）

GET 接口用浏览器就能测；POST 登录这类接口推荐 Apifox（apifox.com，中文免费）或 Postman。第 06 讲会教最小用法，先不装也不影响读讲义。

## 自检总表

按顺序在终端执行一遍，全部通过即可无障碍跟完全课程：

```powershell
python --version   # 3.11+
node -v            # 20.19+
npm -v             # 10+
java -version      # 17.x
mvn -v             # 3.8+ 且 Java 17
git --version      # 任意较新版本
mysql --version    # 8.x（第 05 讲前装好即可）
redis-cli ping     # PONG（第 09 讲前装好即可）
```

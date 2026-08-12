# credgauge

AI 服务余额监控桌面挂件 —— 实时显示 DeepSeek 和 ApiNebula 中转站的余额。

## 功能

- 桌面置顶小挂件，同时显示多个 AI 服务余额
- 每 60 秒自动刷新
- CLI 一次性查询
- 无边框半透明 UI，可拖动
- 零运行时依赖（用 Node 内置 fetch）

## 支持的服务

| 服务 | 数据源 | 需要配置 |
|------|--------|----------|
| DeepSeek | 官方 API `/user/balance` | `DEEPSEEK_API_KEY` |
| ApiNebula | New API `/api/user/self` | `APINEBULA_TOKEN` + `APINEBULA_USER_ID` |

## 快速开始

### 1. 安装

```powershell
git clone https://github.com/w-zjj/credgauge.git
cd credgauge
npm install
```

### 2. 配置凭证

```powershell
Copy-Item .env.example .env
# 编辑 .env 填入你的凭证
```

#### DeepSeek 配置
- 获取地址：https://platform.deepseek.com
- 填入 `DEEPSEEK_API_KEY=sk-xxx`

#### ApiNebula 配置
- 控制台：https://apinebula.ai/zh/console
- `APINEBULA_TOKEN`：个人中心生成的**系统令牌**（非 API Key）
- `APINEBULA_USER_ID`：用户 ID
- `APINEBULA_BASE_URL`：默认 `https://apinebula.ai`，一般不用改

<details>
<summary>如何获取 ApiNebula 用户 ID</summary>

1. 登录 https://apinebula.ai/zh/console
2. 按 F12 打开开发者工具，切到 Console
3. 执行：
   ```javascript
   JSON.parse(localStorage.getItem('user')).id
   ```
4. 输出的数字即用户 ID
</details>

### 3. 全局安装（可选，推荐）

```powershell
npm link
```

全局安装后可在任意目录使用 `cre` / `credgauge` 命令。

### 4. 启动

```powershell
cre                        # 启动桌面挂件（简写，需 npm link）
credgauge widget           # 等同效果
```

## 命令

| 命令 | 说明 |
|------|------|
| `cre` | 启动桌面挂件（简写） |
| `credgauge widget` | 启动桌面挂件 |
| `credgauge deepseek` | 查询 DeepSeek 余额 |
| `credgauge apinebula` | 查询 ApiNebula 余额 |
| `credgauge all` | 查询所有已配置的服务 |
| `credgauge -v` | 显示版本 |
| `credgauge -h` | 显示帮助 |

## 挂件说明

挂件以半透明小窗置顶显示在桌面，每个服务一行：

```
┌──────────────────────────┐
│ ● DeepSeek    ¥0.39      │
│ ● ApiNebula  ¥34.01      │
│                      ×   │
└──────────────────────────┘
```

- 状态点：绿色 = 可用，红色 = 不可用/查询失败
- 窗口可拖动到任意位置
- 点击右上角 × 关闭

## 技术栈

- Node.js 18+ (ESM)
- Electron（桌面挂件）
- 零运行时依赖

## 项目结构

```
src/
├── index.js              # 库入口，导出各 provider
├── cli.js                # CLI（deepseek/apinebula/all/widget）
├── cre.js                # `cre` 简写入口
├── env.js                # .env 加载
├── providers/
│   ├── deepseek.js       # DeepSeek API 封装
│   └── apinebula.js      # ApiNebula (New API) 封装
└── widget/
    ├── main.js           # Electron 主进程（并发查询多 provider）
    ├── preload.js        # IPC 桥
    └── renderer/         # 挂件 UI（HTML/CSS/JS）
```

## 开发

```powershell
npm start                 # 启动挂件（开发）
npm run balance           # CLI 查询
```

## 常见问题

<details>
<summary>启动挂件时出现 GPU 缓存错误</summary>

Electron 启动时可能输出 `Unable to map Index file` / `Gpu Cache Creation failed` 等错误，这是 GPU 缓存权限警告，**不影响挂件运行**，可忽略。
</details>

<details>
<summary>Nushell 中 <code>cre</code> 命令找不到</summary>

Nushell 可能未继承 npm 全局 bin 目录到 PATH。在 `config.nu` 中添加（注意用正斜杠）：

```nushell
$env.PATH = ($env.PATH | append "C:/Users/<你的用户名>/AppData/Roaming/TRAE SOLO CN/ModularData/ai-agent/vm/tools/node")
```

重启 Nushell 后生效。
</details>

<details>
<summary>ApiNebula 令牌失效怎么办</summary>

挂件状态点变红、CLI 返回 `401 Unauthorized` 表示令牌失效。去 https://apinebula.ai/zh/console 个人中心重新生成系统令牌，更新 `.env` 中的 `APINEBULA_TOKEN`，重启挂件即可。
</details>

## License

MIT

# credgauge

AI 服务余额监控桌面挂件 —— 实时显示 DeepSeek 和 ApiNebula 中转站的余额。

## 功能

- 桌面置顶小挂件，同时显示多个 AI 服务余额
- 每 60 秒自动刷新
- CLI 一次性查询
- 无边框半透明 UI，可拖动

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

### 2. 配置

```powershell
Copy-Item .env.example .env
# 编辑 .env 填入你的凭证
```

#### DeepSeek 配置
- 获取 API Key：https://platform.deepseek.com
- 填入 `DEEPSEEK_API_KEY=sk-xxx`

#### ApiNebula 配置
- 控制台：https://apinebula.ai/zh/console
- `APINEBULA_TOKEN`：个人中心生成的**系统令牌**（非 API Key）
- `APINEBULA_USER_ID`：个人中心查看的用户 ID
- `APINEBULA_BASE_URL`：默认 `https://apinebula.ai`，一般不用改

### 3. 全局安装（可选）

```powershell
npm link
```

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
│ ● ApiNebula  ¥12.50      │
│                      ×   │
└──────────────────────────┘
```

- 状态点：绿色 = 可用，红色 = 不可用/查询失败
- 窗口可拖动到任意位置
- 点击右上角 × 关闭

## 技术栈

- Node.js 18+ (ESM)
- Electron（桌面挂件）
- 零运行时依赖（用 Node 内置 fetch）

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

## License

MIT

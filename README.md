# credgauge

DeepSeek 余额监控桌面挂件 —— 实时显示你的 DeepSeek API 余额。

## 功能

- 桌面置顶小挂件，实时显示 DeepSeek 余额
- 每 60 秒自动刷新
- CLI 一次性查询
- 无边框半透明 UI，可拖动

## 快速开始

### 1. 安装

```powershell
git clone https://github.com/w-zjj/credgauge.git
cd credgauge
npm install
```

### 2. 配置 API Key

```powershell
Copy-Item .env.example .env
# 编辑 .env 填入你的 DeepSeek API Key
```

获取 API Key：https://platform.deepseek.com

### 3. 全局安装（可选）

```powershell
npm link
```

全局安装后可在任意目录使用 `cre` / `credgauge` 命令。

### 4. 启动

```powershell
cre                        # 启动桌面挂件（简写，需 npm link）
credgauge widget           # 等同效果
credgauge balance          # 一次性查询余额
```

## 命令

| 命令 | 说明 |
|------|------|
| `cre` | 启动桌面挂件（简写） |
| `credgauge widget` | 启动桌面挂件 |
| `credgauge balance` | 查询一次余额并打印 |
| `credgauge -v` | 显示版本 |
| `credgauge -h` | 显示帮助 |

## 挂件说明

启动后挂件会以半透明小窗置顶显示在桌面：

- 状态点：绿色 = 可用，红色 = 不可用
- 余额数字：总余额（含赠金和充值）
- 窗口可拖动到任意位置
- 点击右上角 × 关闭

## 技术栈

- Node.js 18+ (ESM)
- Electron（桌面挂件）
- DeepSeek API (`/user/balance`)
- 零运行时依赖

## 项目结构

```
src/
├── index.js          # 库入口
├── client.js         # DeepSeek API 封装
├── cli.js            # CLI（balance/widget 命令）
├── cre.js            # `cre` 简写入口
├── env.js            # .env 加载
└── widget/
    ├── main.js       # Electron 主进程
    ├── preload.js    # IPC 桥
    └── renderer/     # 挂件 UI（HTML/CSS/JS）
```

## 开发

```powershell
npm start             # 启动挂件（开发）
npm run balance       # CLI 查询余额
```

## License

MIT

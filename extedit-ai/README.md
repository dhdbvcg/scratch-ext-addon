# 扩展编辑AI (ExtEditAI)

ExtensionBuilder（Scratch / TurboWarp 扩展编辑器）的 AI 插件，可以帮你**编写积木、修改代码、解释逻辑**。支持 OpenAI / 智谱清言 / DeepSeek / Anthropic 等多种大模型，内置工作区读取、积木搜索、代码导出等工具调用（function calling）。

> 由 Bilup Nova（Gandi 插件 AI Assistant）派生而来，按 AGPL-3.0-or-later 协议开源。

## 功能

- 💬 **多轮对话**：左侧会话列表，支持新建 / 切换 / 删除会话，对话内容本地保存。
- 🤖 **多模型 / 多供应商**：OpenAI、智谱清言、DeepSeek、Anthropic，以及自定义 OpenAI / Anthropic 兼容端点；可在设置里添加任意数量的 Agent 与模型。
- 🛠 **工具调用**：AI 可以主动调用以下工具了解你的项目——
  - `get_workspace_overview` 获取工作区积木概览（数量 / 类型 / 每个积木信息）
  - `search_blocks` 按 opcode 或文本搜索积木
  - `get_current_code` 导出当前工作区生成的 JavaScript 代码
  - `get_custom_blocks_info` 获取已定义的自定义积木列表
  - `update_todo_list` 更新任务进度，方便你看到 AI 在做什么
- ⚙️ **本地配置**：API Key 与 Agent 配置仅保存在浏览器 localStorage，不上传任何服务器。
- 📤 **导出会话**：一键把对话导出为 `.txt` 文本。

## 安装

在 ExtensionBuilder 的「设置 → 插件管理 → 安装插件」中输入仓库来源：

```
github:dhdbvcg/scratch-ext-addon
```

或单独导入本目录的 `index.js` 进行安装。

安装后，编辑器顶部工具栏会出现「扩展编辑AI」按钮，点击即可打开 AI 面板。

## 目录结构

```
extedit-ai/
├── index.js                 # 入口（自包含：UI 运行时已内联为 base64，一键安装即用）
├── README.md
├── LICENSE                  # GNU AGPL-3.0
├── build-umd.cjs            # 构建脚本：把 lib 下源码打包成单文件 UMD
└── lib/
    ├── AIAssistant.jsx      # 主 UI 组件（React）
    ├── provider.js          # 大模型请求（OpenAI 兼容 / Anthropic 流式）
    ├── tools.js             # AI 可调用的工具定义与执行
    ├── store.js             # localStorage 持久化（Agent / 会话 / 设置）
    └── ai-assistant.umd.js  # 由 build-umd.cjs 生成的运行时包（已内联进 index.js）
```

> `index.js` 已把 `lib/ai-assistant.umd.js` 以 base64 内联，因此「一键安装」（仅下载 `index.js`）即可使用，无需依赖同级 `lib/` 资源文件。`lib/` 与 `build-umd.cjs` 仅用于源码维护与重新构建。

## 开发与构建

`ai-assistant.umd.js` 是由 `lib/` 下 4 个源码文件构建而成的单文件运行时（暴露 `window.ExtEditAI_AIAssistant`）。
修改 `lib/` 下的源码后，需重新构建并重新内联到 `index.js`：

```bash
node build-umd.cjs          # 生成 lib/ai-assistant.umd.js
# 再将 ai-assistant.umd.js 的 base64 重新写入 index.js 的 UMD_B64 常量
```

构建依赖 `@babel/core`、`@babel/preset-env`、`@babel/preset-react`（位于 scratch-gui 项目的 node_modules，脚本内已写死路径；如需迁移请自行调整 `BABEL_ROOT`）。

## 作者与致谢

派生自 Gandi 插件 [ai-assistant](https://github.com/little-starts/gandi-plugins)（原名 Bilup Nova），原作者：

- 白猫@CCW
- 酷可@CCW
- PPN-design
- RyaninCn11

## 开源协议

[GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later)](./LICENSE)

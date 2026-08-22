# scratch-ext-addons

ExtensionBuilder（Scratch / TurboWarp 扩展编辑器）的独立插件集合。
每个插件可经 `github:dhdbvcg/scratch-ext-addons` 一键安装，也可单独导入对应目录的 `index.js`。

## 插件列表

| 目录 | id | 名称 | 分类 | 说明 |
|------|-----|------|------|------|
| `block-duplicate/` | block-duplicate | 快速复制积木 | 编辑器 | Alt/⌘+拖动复制积木 |
| `zebra-striping/` | zebra-striping | 斑马条纹积木 | 视觉 | 嵌套同色积木交替明暗 |
| `editor-square-inputs/` | editor-square-inputs | 方形数字输入框 | 视觉 | 输入框改为方形 |
| `editor-number-arrow-keys/` | editor-number-arrow-keys | 数字框 ↑↓ 微调 | 编辑器 | 方向键微调数值 |
| `transparent-orphans/` | transparent-orphans | 孤立积木半透明 | 视觉 | 未接线积木半透明 |
| `developer-tools/` | developer-tools | 更多右键菜单栏 | 编辑器 | 复制/剪切/粘贴/增强整理 |

## 安装（DeepSeek-Harness 风格）

在编辑器「设置 → 插件管理 → 安装插件」输入来源：

```
github:dhdbvcg/scratch-ext-addons
```

各插件会作为单个插件安装（仓库内所有 `* /index.js` 都会被识别）。也可只导入某个目录的 `index.js` 单独安装。

## 插件格式

每个插件是一个 `export default` 对象：

```js
export default {
  id: 'my-plugin',
  name: '我的插件',
  description: '...',
  category: '自定义',
  css: '...',            // 可选
  setup: async (ctx) => {
    const B = ctx.Blockly;
    // 改装逻辑……
    return function cleanup() { /* 还原原型 / 移除监听 */ };
  }
};
```

`ctx` 提供：`Blockly` / `getWorkspace()` / `document` / `window` / `addToolbarButton()` / `mountPanel()` / `injectCSS()` / 事件总线 / `services` 等。

## 许可证

本仓库插件遵循 MIT 许可证，可自由使用与二次分发。

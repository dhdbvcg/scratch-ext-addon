# 快速复制积木 (block-duplicate)

按住 Alt/⌥ 拖动积木直接复制一份（无需右键）。按住 Ctrl/⌘ 拖动只复制选中的单个积木（cherry pick）。扩展拼装积木时非常好用。

## 安装

在 ExtensionBuilder 的「设置 → 插件管理 → 安装插件」中输入：

```
github:dhdbvcg/scratch-ext-addons
```

或单独安装本目录：选择本地 `index.js` 文件导入。

## 行为

- Alt/⌥ + 拖动：原地复制整块（含子积木）
- Ctrl/⌘ + 拖动：只复制当前选中单块（cherry pick）
- `block_define`（定义积木）与 `procedures_definition` 受保护，不会被复制

## 清理

插件禁用时会还原 `Gesture.prototype.startDraggingBlock_` 并移除监听器。

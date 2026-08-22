# 数字框 ↑↓ 微调 (editor-number-arrow-keys)

聚焦数字输入框时，按 ↑/↓ 键可以快速增减数值，Shift 一次 ±10，替代手动输入。

## 安装

在 ExtensionBuilder 的「设置 → 插件管理 → 安装插件」中输入：

```
github:dhdbvcg/scratch-ext-addons
```

或单独安装本目录：选择本地 `index.js` 文件导入。

## 行为

- ↑：+1（Shift +10）
- ↓：-1（Shift -10）
- 仅对纯数字输入框生效，并同步到对应 Blockly 字段

## 清理

插件禁用时会移除 keydown 监听器。

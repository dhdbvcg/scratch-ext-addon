# 孤立积木半透明 (transparent-orphans)

顶部不是帽子积木的孤立积木（没有以帽子启动的脚本）变淡显示，帮助快速发现未接线的积木；帽子积木本身保持清晰。

## 安装

在 ExtensionBuilder 的「设置 → 插件管理 → 安装插件」中输入：

```
github:dhdbvcg/scratch-ext-addons
```

或单独安装本目录：选择本地 `index.js` 文件导入。

## 判定规则

- 帽子积木（无 previousConnection 且无 outputConnection）：自身及整条脚本保持清晰
- 孤立的非帽子积木（含其下级）：半透明；悬停时恢复不透明

## 清理

插件禁用时会还原 `BlockSvg.prototype.render` 并移除所有标记类。

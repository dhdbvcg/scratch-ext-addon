# 斑马条纹积木 (zebra-striping)

嵌套的相同颜色积木（如「重复」里的「重复」）交替明暗显示，方便看清嵌套层级。

## 安装

在 ExtensionBuilder 的「设置 → 插件管理 → 安装插件」中输入：

```
github:dhdbvcg/scratch-ext-addons
```

或单独安装本目录：选择本地 `index.js` 文件导入。

## 行为

对所有「顶层积木」递归遍历子孙积木；当子积木颜色与父积木相同时交替加亮/变暗，帮助区分嵌套层级。

## 清理

插件禁用时会还原 `BlockSvg.prototype.render`。

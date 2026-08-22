# 更多右键菜单栏 (developer-tools)

右键积木新增「全部复制（整条脚本）/ 复制积木（单块）/ 剪切积木」，复制内容存入内部剪贴板；点击空白画布会浮现「粘贴」按钮，点击即可粘贴；另含增强「整理积木」。

## 安装

在 ExtensionBuilder 的「设置 → 插件管理 → 安装插件」中输入：

```
github:dhdbvcg/scratch-ext-addons
```

或单独安装本目录：选择本地 `index.js` 文件导入。

## 子选项

- 增强"整理积木"：用分列布局（帽子脚本列 + 孤立列）替代原生整理
- 在鼠标指针处粘贴积木：粘贴到鼠标位置（否则默认偏移 40,40）

## 快捷键

- Ctrl/⌘ + C：复制整条脚本到内部剪贴板
- Ctrl/⌘ + V：粘贴

## 清理

插件禁用时会还原 `Gesture.prototype.handleRightClick`、`ContextMenu.show`、`BlockSvg.prototype.moveOffDragSurface_`、移除监听器与定时器。

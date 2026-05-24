# AGENTS.md — Tab Out (二次开发)

基于 [Tab Out](https://github.com/zarazhangrui/tab-out) (by Zara Zhang) 二次开发的 Chrome 扩展。按域名分组管理标签页，支持页面视图和侧边栏视图。

## 安装步骤

```bash
git clone https://github.com/jinshuok/tab.git
cd tab
```

然后在 Chrome 中加载 `extension/` 文件夹：

1. 打开 `chrome://extensions`
2. 开启**开发者模式**
3. 点击**加载已解压的扩展程序**，选择 `extension/` 文件夹

## 架构

- 纯 Chrome 扩展 (Manifest V3)，无需服务器，无需 npm
- `background.js` — Service Worker，负责角标更新、图标生成、消息路由
- `app.js` — 共享逻辑，页面视图和侧边栏共用
- `shared.js` — 工具函数 (escapeHtml, isSystemPage)
- `index.html` — 完整页面视图
- `sidepanel.html` — Chrome 侧边栏视图
- `style.css` — 共享样式

## 与原版的主要差异

- 点击工具栏图标打开独立页面，不替换新标签页
- 支持 Chrome Side Panel API 侧边栏
- 去掉了 Saved for Later、音效、彩带动画
- CSS 和 JS 大幅精简
- 重复检测覆盖所有 URL 类型（含系统页面）

## 更新

```bash
git pull
```
然后在 `chrome://extensions` 中重新加载扩展。

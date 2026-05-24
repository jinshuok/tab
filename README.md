# Tab Out (二次开发)

**管理你的标签页。**

按域名分组展示所有打开的标签页，支持独立页面或 Chrome 侧边栏两种视图。

基于 [Tab Out](https://github.com/zarazhangrui/tab-out) (by Zara Zhang) 二次开发。

---

## 改动点

- **不再占用新标签页** — 点击工具栏图标打开独立页面，不再替换新标签页
- **支持侧边栏** — 可在 Chrome 侧边栏中使用，切换标签页时保持打开
- **分组内选择处理** — 每个域名卡片内支持勾选、反选、批量关闭
- **双击激活标签页** — 双击标签页行可直接跳转到对应标签页
- **更简洁的界面** — 去掉音效、彩带、Saved for Later 等功能，CSS 大幅精简
- **改进的重复检测** — 检测所有 URL 的重复（含系统页面），一键关闭旧标签

---

## 安装

1. 克隆仓库
   ```bash
   git clone https://github.com/jinshuok/tab.git
   ```
2. 打开 Chrome，进入 `chrome://extensions`
3. 开启右上角**开发者模式**
4. 点击**加载已解压的扩展程序**
5. 选择仓库中的 `extension/` 文件夹

---

## 使用方式

- **点击工具栏图标** — 打开完整页面视图
- **点击"Side Panel"按钮**（页面底部） — 打开侧边栏视图
- **点击"Page View"按钮**（侧边栏右上角） — 切换回页面视图
- **域名分组** — 标签页自动按域名分组在卡片中
- **勾选关闭** — 勾选要关闭的标签页，点击"Close checked"批量关闭
- **关闭整个域名** — 点击卡片右上角 X 可关闭该域名下所有标签页
- **重复检测** — 检测到重复 URL 时顶部显示提示条，一键关闭多余标签

---

## 开源协议

MIT。基于 [Tab Out](https://github.com/zarazhangrui/tab-out) by [Zara Zhang](https://x.com/zarazhangrui)。

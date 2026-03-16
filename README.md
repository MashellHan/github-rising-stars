# GitHub Rising Stars - 每日报告生成指南

## 📍 访问地址

**在线查看（PC/手机通用）：**
https://mashellhan.github.io/github-rising-stars/

**GitHub 仓库：**
https://github.com/MashellHan/github-rising-stars

## ⏰ 定时任务

- **凌晨 2:00** — 自动生成当日新星报告
- **上午 9:00** — iMessage 通知你查看链接

## 📁 本地文件

```
~/clawd/github-rising-stars/
├── index.html          ← 首页（带左侧导航）
├── assets/style.css    ← 共享样式
├── reports/
│   ├── manifest.json   ← 历史索引
│   └── YYYY-MM-DD/     ← 每日报告
│       ├── index.html
│       └── images/
```

## 🔧 手动触发

如果需要手动生成报告：
1. 在 OpenClaw 中说："生成今天的 GitHub 新星报告"
2. 或运行: `neo-github-rising-stars`

## 📊 新星指数

公式: `新星指数 = 周增长 / √总Star`

筛选条件:
- 60 天内创建
- Star ≥ 100
- 活跃开发中
- 指数 ≥ 30

## ✨ 功能

- 每日 Top 5 新星项目详细介绍（500+ 字）
- 项目截图
- 左侧历史导航
- 响应式设计（手机友好）
- 增量更新

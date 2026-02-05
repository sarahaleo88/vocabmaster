# VocabMaster

> 基于 SM-2 间隔重复算法的跨平台词汇学习应用
> A cross-platform vocabulary learning app powered by SM-2 spaced repetition algorithm

## 功能特性 | Features

- 🧠 **SM-2 间隔重复算法** | SM-2 spaced repetition algorithm - 科学记忆，高效背单词
- 📖 **1100+ 内置词汇** | 1100+ built-in words - 包含通用词汇与编程术语
- 📥 **导入导出支持** | CSV/JSON import/export - 灵活管理词汇数据
- 📱 **原生 Android 应用** | Native Android app via Capacitor - 跨平台部署
- 🔌 **离线优先设计** | Offline-first design - 所有数据本地存储，无需网络
- 🎨 **现代界面** | Modern UI - 精美流畅的用户体验

## 技术栈 | Tech Stack

| 类别 | 技术 |
|------|------|
| 前端 Frontend | Vite 7.x + Vanilla JavaScript (ES Modules) |
| 存储 Storage | IndexedDB (via `idb` library) |
| 移动端 Mobile | Capacitor 8.x (Android) |
| 算法 Algorithm | SM-2 Spaced Repetition |

## 快速开始 | Quick Start

### Web 开发 | Web Development

```bash
cd vocabmaster
npm install
npm run dev      # 开发服务器 Dev server at localhost:5173
npm run build    # 生产构建 Production build
```

### Android 构建 | Android Build

```bash
cd vocabmaster
npm run build              # 构建 Web 资源
npx cap sync android       # 同步到 Android 项目
npx cap open android       # 在 Android Studio 中打开
```

## 项目结构 | Project Structure

```
vocabmaster/
├── src/
│   ├── js/              # 核心模块 Core modules
│   │   ├── app.js       # 主入口、路由 Main entry, routing
│   │   ├── db.js        # IndexedDB 封装 Database wrapper
│   │   ├── sm2.js       # SM-2 算法 SM-2 algorithm
│   │   ├── cards.js     # 卡片业务逻辑 Card operations
│   │   ├── importer.js  # 导入功能 Import functionality
│   │   └── settings.js  # 用户设置 User settings
│   ├── css/             # 样式文件 Stylesheets
│   └── data/            # 内置词汇数据 Built-in vocabulary
├── android/             # Capacitor Android 项目
└── landing/             # GitHub Pages 着陆页
```

## 数据格式 | Data Formats

### CSV 格式

```csv
word,translation,example,pronunciation,tags
abandon,放弃,He abandoned the project.,/əˈbændən/,general
```

### JSON 格式

```json
[
  {
    "word": "abandon",
    "translation": "放弃",
    "example": "He abandoned the project.",
    "pronunciation": "/əˈbændən/",
    "tags": ["general"]
  }
]
```

## 文档 | Documentation

- [技术文档 Technical Docs](vocabmaster/README.md) - 架构设计与 SM-2 算法详解
- [Android 发布指南 Release Guide](docs/release/RELEASE_INSTRUCTIONS.md) - APK 打包与发布流程
- [发布概览 Release Overview](docs/release/README_RELEASE.md) - 发布资源导航

## 许可证 | License

MIT License

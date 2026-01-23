# VocabMaster 📚

英语词汇闪卡应用，基于间隔重复记忆法（SM-2算法）。

## ✨ 功能特点

- 🧠 **SM-2间隔重复** - 科学记忆算法，高效背单词
- 📱 **离线优先** - 所有数据存储在本地，无需网络
- 📦 **内置词库** - 100+ 精选词汇（通用 + 编程术语）
- 📥 **导入导出** - 支持 CSV/JSON 格式
- 🎨 **现代界面** - 精美流畅的用户体验

## 🚀 快速开始

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### Android 构建

```bash
# 同步到 Android
npx cap sync

# 打开 Android Studio
npx cap open android
```

## 📁 项目结构

```
vocabmaster/
├── src/
│   ├── js/          # JavaScript 模块
│   │   ├── app.js   # 主应用逻辑
│   │   ├── db.js    # 数据库操作
│   │   ├── sm2.js   # SM-2 算法
│   │   └── ...
│   ├── css/         # 样式文件
│   └── data/        # 内置词汇数据
├── landing/         # GitHub Pages 页面
└── android/         # Capacitor Android 项目
```

## 📝 导入格式

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

## 🛠️ 技术栈

- **前端**: Vanilla HTML/CSS/JS
- **构建**: Vite
- **存储**: IndexedDB (idb)
- **打包**: Capacitor

## 📄 许可证

MIT License

# VocabMaster — 任务列表

基于 [VocabMaster 设计文档](file:///Users/lixiansheng/Desktop/test/docs/plans/2026-01-16-vocabmaster-design.md) 创建的开发任务清单。

---

## 项目初始化

- [ ] **Task 1: Initialize Vite Project**
  - 使用 `npm create vite@latest` 创建项目
  - 配置 `vite.config.js`
  - 创建项目目录结构 (`src/css/`, `src/js/`, `src/data/`, `src/assets/fonts/`)

- [ ] **Task 2: Install and Configure Capacitor**
  - 安装 Capacitor 核心包和 Android 平台
  - 创建 `capacitor.config.ts`
  - 初始化 Android 项目

---

## 核心模块开发

- [ ] **Task 3: Install IDB Library and Create Database Module**
  - 安装 `idb` 库
  - 创建 `src/js/db.js` — IndexedDB 封装
  - 实现 Card 存储的 CRUD 操作

- [ ] **Task 4: Implement SM-2 Spaced Repetition**
  - 创建 `src/js/sm2.js`
  - 实现 easiness factor 计算
  - 实现 interval 计算逻辑
  - 支持 Again/Hard/Good/Easy 四种评分

- [ ] **Task 5: Create Card Service Module**
  - 创建 `src/js/cards.js`
  - 实现卡片的增删改查
  - 实现获取今日复习卡片的逻辑
  - 实现新卡片每日限制逻辑

- [ ] **Task 6: Create Settings Module**
  - 创建 `src/js/settings.js`
  - 使用 localStorage 存储设置
  - 实现 newCardsPerDay、todayNewCardsCount、lastReviewDate 管理

---

## 路由与界面管理

- [ ] **Task 7: Create Router and Screen Management**
  - 创建 `src/js/app.js`
  - 实现简单的 hash-based 路由
  - 实现屏幕切换逻辑

---

## UI 屏幕开发

- [ ] **Task 8: Create Home Screen**
  - 显示 Due Today 数量
  - 显示 New Cards 进度
  - 显示 Total Cards 数量
  - Start Review 按钮
  - Add Card / Browse / Settings 导航

- [ ] **Task 9: Create Review Screen**
  - 卡片翻转交互
  - 显示单词、音标、翻译、例句
  - Again/Hard/Good/Easy 按钮
  - 进度显示 (12/35)
  - 退出按钮

- [ ] **Task 10: Create Card List Screen**
  - 可搜索的卡片列表
  - 按标签筛选 (general/programming/user-added)
  - 点击编辑或删除
  - 滑动删除（带确认）

- [ ] **Task 11: Create Add Card Screen**
  - 添加/编辑卡片表单
  - 输入字段: word, translation, example, pronunciation, tags

- [ ] **Task 12: Create Settings Screen**
  - 每日新卡片数量滑块 (5-50)
  - 存储使用量显示
  - 导出功能 (Full Backup / Word List Only)
  - 导入功能
  - 重置进度（带确认）
  - 应用版本显示

---

## 导入导出功能

- [ ] **Task 13: Complete Import Functionality**
  - 创建 `src/js/importer.js`
  - 支持 CSV 和 JSON 格式
  - 智能列检测 + 固定顺序回退
  - 重复跳过
  - 导入预览 (数量 + 前5个词)

---

## 内置数据

- [x] **Task 14: Create Built-in Vocabulary Data**
  - 创建 `src/data/vocabulary.json`
  - 首次启动时加载到 IndexedDB
  - 每个词包含: translation, example, pronunciation
  
  **子任务拆分 (8 × 100词):**
  - [x] **Task 14.1: General Vocabulary Batch 1** (词汇 1-100)
    - 日常生活类词汇 (basic daily life)
  - [x] **Task 14.2: General Vocabulary Batch 2** (词汇 101-200)
    - 情感与社交类词汇 (emotions & social)
  - [x] **Task 14.3: General Vocabulary Batch 3** (词汇 201-300)
    - 工作与商务类词汇 (work & business)
  - [x] **Task 14.4: General Vocabulary Batch 4** (词汇 301-400)
    - 学术与教育类词汇 (academic & education)
  - [x] **Task 14.5: General Vocabulary Batch 5** (词汇 401-500)
    - 科技与媒体类词汇 (technology & media)
  - [x] **Task 14.6: General Vocabulary Batch 6** (词汇 501-600)
    - 自然与环境类词汇 (nature & environment)
  - [x] **Task 14.7: General Vocabulary Batch 7** (词汇 601-700)
    - 抽象概念与高级词汇 (abstract & advanced)
  - [x] **Task 14.8: Programming Vocabulary** (词汇 701-800)
    - 编程与技术术语 (programming terms)

---

## 资源与样式

- [ ] **Task 15: Add Charis SIL Font**
  - 下载 Charis SIL 字体 (woff2 格式)
  - 放置到 `src/assets/fonts/`
  - 在 CSS 中配置 @font-face
  - 应用到音标显示

- [ ] **Task 16: Add PWA Manifest and Icons**
  - 创建 manifest.json
  - 添加应用图标
  - 配置 `index.html` 元数据

---

## 构建与发布

- [ ] **Task 17: Final Build and Sync**
  - 运行 `npm run build`
  - 运行 `npx cap sync`
  - 在 Android Studio 中构建 APK
  - 测试 APK 安装和功能

- [ ] **Task 18: Create README and Landing Page**
  - 创建项目 README.md (截图、功能、CSV 格式文档)
  - 创建 `landing/index.html` (GitHub Pages)
  - 下载按钮 + 安装指南
  - 创建 `docs/android-setup.md` 和 `docs/csv-format.md`

# VocabMaster 技术文档

英语词汇闪卡应用，基于间隔重复记忆法（SM-2算法），专为中文用户设计。

## 架构设计

### 模块结构

```
src/js/
├── app.js       # 主入口、Hash 路由、状态管理
├── db.js        # IndexedDB 数据库封装 (基于 idb 库)
├── sm2.js       # SM-2 间隔重复算法实现
├── cards.js     # 卡片 CRUD 操作、到期查询
├── importer.js  # CSV/JSON 导入、重复检测
└── settings.js  # 用户偏好设置管理
```

### 数据流

```
用户操作 → app.js(路由分发) → cards.js(业务逻辑) → db.js(数据持久化) → IndexedDB
```

## 数据模型

### Card Schema

```javascript
{
  id: string,           // UUID，唯一标识
  word: string,         // 英文单词
  translation: string,  // 中文翻译
  pronunciation: string,// 音标
  example: string,      // 例句
  tags: string[],       // 标签分类 (如 "general", "programming")

  // SM-2 算法字段
  easiness: number,     // 难度系数 (最小 1.3)
  interval: number,     // 复习间隔（天）
  repetitions: number,  // 连续成功复习次数
  nextReview: string,   // 下次复习时间 (ISO 日期字符串)

  createdAt: string,    // 创建时间
  isBuiltIn: boolean    // 是否为内置词汇
}
```

## SM-2 算法

### 概述

SM-2（SuperMemo 2）是一种经典的间隔重复算法，通过调整复习间隔来优化记忆效率。

### 评分标准

| 评分 | 含义 | 效果 |
|------|------|------|
| 0 (Again) | 完全忘记 | 重置间隔为 1 天，重置重复次数 |
| 1 (Hard) | 困难回忆 | 间隔 × 1.2 |
| 2 (Good) | 正常回忆 | 间隔 × EF |
| 3 (Easy) | 轻松回忆 | 间隔 × EF × 1.3 |

### EF (Easiness Factor) 计算

```javascript
EF = EF + (0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02))
```

- **最小值**: 1.3（防止间隔过短）
- **初始值**: 2.5

### 间隔递进规则

1. **首次复习**: 1 天
2. **第二次复习**: 6 天
3. **后续复习**: `interval × EF`

### 代码实现 (sm2.js)

```javascript
export function calculateNextReview(card, rating) {
  let { easiness, interval, repetitions } = card;

  // 更新 EF
  easiness = Math.max(1.3, easiness + (0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02)));

  if (rating === 0) {
    // 完全忘记，重置
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easiness);
    }
  }

  return { easiness, interval, repetitions, nextReview: addDays(new Date(), interval) };
}
```

## 内置词汇

### 数据来源

- **位置**: `src/data/vocabulary.json`
- **数量**: 1100+ 词汇
- **分类**: 8 个批次（通用词汇 + 编程术语）

### 词汇结构

```json
{
  "batches": [
    {
      "name": "Batch 1",
      "words": [
        {
          "word": "abandon",
          "translation": "放弃",
          "pronunciation": "/əˈbændən/",
          "example": "He abandoned the project.",
          "tags": ["general"]
        }
      ]
    }
  ]
}
```

## 开发命令

```bash
npm install         # 安装依赖
npm run dev         # 开发服务器 (localhost:5173)
npm run build       # 生产构建 (输出到 dist/)
npm run preview     # 预览生产构建
npm test            # 运行测试 (Vitest)
```

## Android 部署

### 环境要求

- Android Studio (最新版本)
- Android SDK (API 30+)
- JDK 11+

### 构建流程

```bash
# 1. 构建 Web 资源
npm run build

# 2. 同步到 Android 项目
npx cap sync android

# 3. 打开 Android Studio
npx cap open android

# 4. 在 Android Studio 中构建 APK
# Build → Generate Signed Bundle/APK → APK
```

### Capacitor 配置

```javascript
// capacitor.config.json
{
  "appId": "com.vocabmaster.app",
  "appName": "VocabMaster",
  "webDir": "dist",
  "server": {
    "androidScheme": "https"
  }
}
```

## 目录结构

```
vocabmaster/
├── src/
│   ├── js/              # JavaScript 模块
│   ├── css/             # 样式文件
│   └── data/            # 词汇数据
├── android/             # Android 项目 (Capacitor)
│   ├── app/             # 应用模块
│   │   ├── src/         # Android 源码
│   │   └── build.gradle # 应用级构建配置
│   └── build.gradle     # 项目级构建配置
├── landing/             # GitHub Pages 着陆页
├── index.html           # 应用入口
├── package.json         # Node.js 依赖配置
├── vite.config.js       # Vite 构建配置
└── capacitor.config.json # Capacitor 配置
```

## 许可证

MIT License

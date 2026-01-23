# VocabMaster - Android 发布完整指南

欢迎！我已经为您的Android项目创建了完整的发布工具和文档。

## 📦 已创建的资源

### 📖 文档文件

1. **RELEASE_INSTRUCTIONS.md** ⭐ 推荐首先阅读
   - 快速开始指南
   - 详细的分步说明
   - 常见问题和答案
   - 检查清单

2. **ANDROID_RELEASE_GUIDE.md**
   - 详细的技术文档
   - 签名密钥配置
   - Gradle构建说明
   - 版本管理
   - 安全最佳实践

3. **README_RELEASE.md** (本文件)
   - 资源概览
   - 快速导航

### 🔧 自动化脚本

1. **scripts/setup-signing.sh**
   ```bash
   chmod +x scripts/setup-signing.sh
   ./scripts/setup-signing.sh
   ```
   - 生成Android签名密钥库
   - 指导式界面
   - 首次使用时运行一次

2. **scripts/release.sh**
   ```bash
   chmod +x scripts/release.sh
   ./scripts/release.sh 1.0.0
   ```
   - 自动化完整的构建流程
   - 包括Web资源构建、Capacitor同步、APK打包
   - 提供下一步指导

## 🚀 快速开始（3步）

### 步骤 1️⃣ : 设置签名（仅首次）

```bash
# 1. 进入项目目录
cd /path/to/vocabmaster

# 2. 运行签名设置
./scripts/setup-signing.sh

# 3. 按照提示输入密码和个人信息
```

### 步骤 2️⃣ : 编辑构建配置

编辑 `vocabmaster/android/app/build.gradle`，在 `android {}` 块中添加：

```gradle
signingConfigs {
    release {
        storeFile file('vocabmaster-release-key.jks')
        storePassword 'YOUR_KEYSTORE_PASSWORD'  // 替换为您的密码
        keyAlias 'vocabmaster-key'
        keyPassword 'YOUR_KEY_PASSWORD'          // 替换为您的密码
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
    }
}
```

### 步骤 3️⃣ : 构建并发布

```bash
# 运行自动化脚本
./scripts/release.sh 1.0.0

# 脚本会输出后续操作指导
```

## 📋 完整工作流

```
┌─────────────────────────────────────────────────────────┐
│          VocabMaster Android 发布工作流                 │
└─────────────────────────────────────────────────────────┘

[准备阶段]
  ↓
  1. 阅读 RELEASE_INSTRUCTIONS.md
  2. 运行 ./scripts/setup-signing.sh
  3. 编辑 build.gradle 中的签名配置
  4. 确保所有代码已测试
  ↓
[构建阶段]
  ↓
  5. 运行 ./scripts/release.sh 1.0.0
     (或手动按照 ANDROID_RELEASE_GUIDE.md 步骤操作)
  ↓
[验证阶段]
  ↓
  6. 在设备或模拟器上测试APK
  7. 验证APK签名
  ↓
[发布阶段]
  ↓
  8. 提交到Git
     git commit -m "Release version 1.0.0"
  9. 创建标签
     git tag -a v1.0.0 -m "VocabMaster Release v1.0.0"
  10. 推送到远程
     git push origin main
     git push origin v1.0.0
  11. 创建GitHub Release
     gh release create v1.0.0 \
       --title "VocabMaster v1.0.0" \
       --notes "Release notes here" \
       vocabmaster/android/app/build/outputs/apk/release/app-release.apk
  ↓
[完成！]
  ↓
  用户可从GitHub下载APK安装使用
```

## 🎯 使用场景

### 场景 1: 首次发布

```bash
# 1. 设置签名
./scripts/setup-signing.sh

# 2. 编辑 build.gradle 添加签名配置
# 3. 构建
./scripts/release.sh 1.0.0

# 4. 创建Release
gh release create v1.0.0 \
  --title "VocabMaster v1.0.0" \
  --notes "Initial release" \
  vocabmaster/android/app/build/outputs/apk/release/app-release.apk
```

### 场景 2: 更新版本发布

```bash
# 1. 更新版本号 (build.gradle)
#    versionCode 2
#    versionName "1.1"

# 2. 构建新版本
./scripts/release.sh 1.1

# 3. 创建新Release
gh release create v1.1 \
  --title "VocabMaster v1.1" \
  --notes "Bug fixes and improvements" \
  vocabmaster/android/app/build/outputs/apk/release/app-release.apk
```

### 场景 3: 手动构建（不使用脚本）

```bash
cd vocabmaster

# 构建Web资源
npm install
npm run build

# 同步到Android
npx cap sync android

# 构建APK
cd android
./gradlew assembleRelease

# APK位置
ls -lh app/build/outputs/apk/release/app-release.apk
```

## 📁 文件结构

```
vocabmaster/
├── RELEASE_INSTRUCTIONS.md    ← 开始这里！
├── ANDROID_RELEASE_GUIDE.md   ← 详细文档
├── README_RELEASE.md          ← 本文件
├── scripts/
│   ├── setup-signing.sh       ← 签名设置
│   ├── release.sh             ← 自动构建
│   └── ...其他脚本
├── vocabmaster/
│   ├── android/
│   │   ├── app/
│   │   │   ├── build.gradle   ← 修改这里
│   │   │   ├── vocabmaster-release-key.jks  ← 签名密钥（本地生成）
│   │   │   └── src/
│   │   ├── gradlew            ← Gradle包装器
│   │   └── ...
│   ├── src/
│   ├── package.json
│   └── ...
└── ...
```

## 🔐 安全提示

1. **签名密钥库**
   - 妥善保管 `vocabmaster-release-key.jks`
   - 不要上传到GitHub（已在.gitignore中）
   - 定期备份

2. **密码**
   - 不要在代码中硬编码
   - 使用环境变量或本地配置文件
   - 记住密钥库密码（丢失无法恢复）

3. **版本控制**
   - 添加到 `.gitignore`:
     ```
     vocabmaster-release-key.jks
     *.jks
     local.properties
     ```

## 🆘 故障排除

### 常见问题

**Q: 脚本不可执行**
```bash
chmod +x scripts/*.sh
```

**Q: 找不到keytool**
```bash
# 确保已安装JDK
java -version
# 如果没有，安装JDK 11+
```

**Q: build.gradle编辑错误**
- 查看 ANDROID_RELEASE_GUIDE.md 中的完整示例
- 使用IDE的代码补全

**Q: Gradle同步失败**
```bash
# 清理构建
./gradlew clean

# 更新依赖
./gradlew --refresh-dependencies
```

详见 RELEASE_INSTRUCTIONS.md 中的 "常见问题" 部分。

## 📞 获取帮助

1. **阅读文档**
   - 首先阅读 `RELEASE_INSTRUCTIONS.md`
   - 查看 `ANDROID_RELEASE_GUIDE.md` 获取技术细节

2. **查看日志**
   ```bash
   ./gradlew assembleRelease --info
   ```

3. **官方资源**
   - [Android官方文档](https://developer.android.com)
   - [Capacitor指南](https://capacitorjs.com/docs)
   - [GitHub帮助](https://docs.github.com)

## ✅ 发布前检查清单

- [ ] 阅读 RELEASE_INSTRUCTIONS.md
- [ ] 运行 ./scripts/setup-signing.sh
- [ ] 配置 build.gradle 签名信息
- [ ] 所有功能已测试
- [ ] 版本号已更新
- [ ] 更新日志已准备
- [ ] git status 显示工作区干净
- [ ] APK已在真机上测试
- [ ] 密钥库已备份

## 🎉 发布成功！

一旦您的Release发布到GitHub：

1. **用户可以**
   - 访问 GitHub Releases 页面
   - 下载最新的APK文件
   - 安装到Android设备

2. **后续更新**
   - 重复相同步骤以发布新版本
   - 每个版本创建一个新Release

3. **扩展功能**
   - 设置GitHub Actions自动构建
   - 发布到Google Play Store
   - 集成Crashlytics监控崩溃

## 📚 相关文档导航

```
快速开始 (5分钟)
  ↓
RELEASE_INSTRUCTIONS.md - 完整指南 (20分钟)
  ↓
ANDROID_RELEASE_GUIDE.md - 技术深入 (需要时查看)
  ↓
官方文档 - 特定问题解决
```

---

**现在就开始吧！** 👉 打开 `RELEASE_INSTRUCTIONS.md` 开始您的第一次发布。

**祝您发布顺利！** 🚀

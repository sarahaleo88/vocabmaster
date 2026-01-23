# VocabMaster - Android APK发布说明

欢迎！本文档将指导您完成将VocabMaster Android项目打包为APK并发布到GitHub的完整流程。

## 📋 目录

1. [快速开始](#快速开始)
2. [详细步骤](#详细步骤)
3. [使用脚本自动化](#使用脚本自动化)
4. [常见问题](#常见问题)
5. [参考资源](#参考资源)

## 🚀 快速开始

如果您想立即开始，按以下步骤操作：

### 环境检查
```bash
# 检查必要工具
java -version        # 应该是JDK 11+
npm --version        # 应该是Node.js 16+
git --version        # 应该是Git 2.0+
```

### 一键发布（仅限已配置密钥库的用户）
```bash
# 1. 给脚本执行权限
chmod +x scripts/release.sh

# 2. 运行发布脚本
./scripts/release.sh 1.0.0
```

### 如果您是第一次，请先设置签名密钥
```bash
# 1. 给脚本执行权限
chmod +x scripts/setup-signing.sh

# 2. 运行设置脚本
./scripts/setup-signing.sh

# 3. 按照提示完成密钥库生成
```

## 📖 详细步骤

### 步骤1：安装依赖

```bash
cd vocabmaster

# 安装Node.js依赖
npm install

# 构建Web资源
npm run build
```

**预期结果**: 生成 `dist/` 目录，包含编译后的Web资源

### 步骤2：配置Android签名

**第一次使用时**：

```bash
# 生成密钥库
keytool -genkey -v -keystore android/app/vocabmaster-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias vocabmaster-key
```

**编辑 `android/app/build.gradle`**:

在 `android {}` 块中添加以下配置：

```gradle
android {
    // 其他现有配置...

    signingConfigs {
        release {
            storeFile file('vocabmaster-release-key.jks')
            storePassword 'YOUR_KEYSTORE_PASSWORD'
            keyAlias 'vocabmaster-key'
            keyPassword 'YOUR_KEY_PASSWORD'
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

**安全提示**:
- 替换 `YOUR_KEYSTORE_PASSWORD` 和 `YOUR_KEY_PASSWORD` 为您的实际密码
- 不要将密钥库文件提交到Git
- 考虑使用环境变量或本地配置文件存储密码

### 步骤3：同步Capacitor

```bash
cd vocabmaster

# 同步Web资源到Android
npx cap sync android
```

### 步骤4：构建APK

```bash
cd vocabmaster/android

# 方法A：使用gradlew（推荐）
./gradlew assembleRelease

# 方法B：使用Android Studio
# Build → Generate Signed Bundle/APK → 选择 APK
```

**预期结果**: APK文件生成在 `app/build/outputs/apk/release/app-release.apk`

### 步骤5：验证APK

```bash
# 检查APK是否已签名
jarsigner -verify app/build/outputs/apk/release/app-release.apk

# 列出APK内容
unzip -l app/build/outputs/apk/release/app-release.apk | head -20
```

### 步骤6：提交到Git

```bash
# 回到项目根目录
cd /path/to/vocabmaster

# 添加所有更改
git add .

# 提交
git commit -m "Release version 1.0.0"

# 创建标签
git tag -a v1.0.0 -m "VocabMaster Release v1.0.0"

# 推送到远程
git push origin main
git push origin v1.0.0
```

### 步骤7：创建GitHub Release

#### 使用GitHub CLI（推荐）

```bash
gh release create v1.0.0 \
  --title "VocabMaster v1.0.0" \
  --notes "Initial release of VocabMaster Android application

## Features
- Vocabulary learning with flashcards
- Spaced Repetition algorithm (SM-2)
- Local data persistence
- Cross-platform support (iOS/Android)

## Download
Download the APK file below to install on your Android device." \
  vocabmaster/android/app/build/outputs/apk/release/app-release.apk
```

#### 使用GitHub Web界面

1. 访问 https://github.com/[您的用户名]/vocabmaster
2. 点击右侧的 "Releases"
3. 点击 "Create a new release"
4. 版本标签: `v1.0.0`
5. 发布标题: `VocabMaster v1.0.0`
6. 描述: 添加更新说明和功能列表
7. 上传文件: `vocabmaster/android/app/build/outputs/apk/release/app-release.apk`
8. 点击 "Publish release"

## 🤖 使用脚本自动化

### release.sh - 完整构建流程

```bash
# 构建版本1.0.0
./scripts/release.sh 1.0.0

# 使用默认版本（1.0.0）
./scripts/release.sh
```

脚本会自动执行以下操作：
1. ✓ 检查构建环境
2. ✓ 安装依赖
3. ✓ 构建Web资源
4. ✓ 同步Capacitor
5. ✓ 构建Release APK
6. ✓ 验证APK文件

### setup-signing.sh - 初始化签名

```bash
./scripts/setup-signing.sh
```

这个脚本将指导您生成签名密钥库。

## ❓ 常见问题

### Q1: APK文件在哪里？

**答**: 构建完成后，APK文件位于：
```
vocabmaster/android/app/build/outputs/apk/release/app-release.apk
```

### Q2: 如何提高APK构建速度？

**答**:
- 首次构建会比较慢，因为需要下载Gradle和依赖
- 后续构建会快得多（已缓存）
- 可以在 `local.properties` 中设置并行构建：
  ```
  org.gradle.parallel=true
  org.gradle.workers.max=4
  ```

### Q3: APK太大怎么办？

**答**: 已在build.gradle中启用了代码混淆和资源压缩：
```gradle
minifyEnabled true
shrinkResources true
```
可以尝试以下方法进一步减小：
- 使用Dynamic Feature Modules
- 移除未使用的依赖
- 压缩图片资源

### Q4: 如何在设备上测试APK？

**答**:
```bash
# 方法1：使用adb
adb install -r vocabmaster/android/app/build/outputs/apk/release/app-release.apk

# 方法2：使用gradlew
cd vocabmaster/android
./gradlew installRelease

# 方法3：手动安装
# 将APK文件传到设备，点击安装
```

### Q5: 如何更新版本号？

**答**: 编辑 `vocabmaster/android/app/build.gradle`：
```gradle
defaultConfig {
    versionCode 2        // 内部版本号（必须递增）
    versionName "1.1"    // 用户可见版本号
}
```

### Q6: 忘记了密钥库密码怎么办？

**答**: 不幸的是，如果您丢失了密码，您需要生成新的密钥库。这意味着：
- 无法更新现有的Google Play Store应用程序
- 需要重新提交新版本
- 用户会看到新的应用程序

为了避免这种情况，请妥善保管密钥库文件和密码。

### Q7: 可以在没有Android Studio的情况下构建吗？

**答**: 可以！以下步骤只需要命令行：
1. 安装Android SDK Command Line Tools
2. 接受许可证: `sdkmanager --licenses`
3. 安装必要的SDK: `sdkmanager "platforms;android-34"`
4. 使用gradlew构建

### Q8: 如何自动化GitHub Release？

**答**: 可以使用GitHub Actions设置CI/CD。请参考 [参考资源](#参考资源) 中的GitHub Actions文档。

## 📚 参考资源

### 官方文档
- [Android签名文档](https://developer.android.com/studio/publish/app-signing)
- [Capacitor Android指南](https://capacitorjs.com/docs/android)
- [GitHub Release指南](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
- [GitHub CLI文档](https://cli.github.com/manual/)

### 工具和教程
- [keytool文档](https://docs.oracle.com/javase/tutorial/security/toolfilex/index.html)
- [Gradle Android Plugin](https://developer.android.com/studio/build)
- [GitHub Actions for Android](https://github.com/android-actions)

### 安全最佳实践
- [Android安全最佳实践](https://developer.android.com/training/articles/security-overview)
- [密钥管理](https://developer.android.com/studio/publish/app-signing-considerations)

## 📝 检查清单

在发布前，请确保：

- [ ] 所有功能都已测试
- [ ] 版本号已更新
- [ ] 更新日志已准备
- [ ] 签名密钥库存在并可访问
- [ ] Git仓库已清理（所有更改已提交）
- [ ] APK已在真机或模拟器上测试
- [ ] Release Notes已准备
- [ ] GitHub仓库已创建

## 🆘 获取帮助

如果遇到问题：

1. 查看本文档的 [常见问题](#常见问题) 部分
2. 阅读 `ANDROID_RELEASE_GUIDE.md` 获取更详细的信息
3. 检查Gradle构建日志：
   ```bash
   ./gradlew assembleRelease --info
   ```
4. 查看Android官方文档和Capacitor指南

## 📧 联系方式

如有疑问，请通过以下方式联系：
- GitHub Issues: [您的仓库]/issues
- Email: daizongfuruhe0@gmail.com

---

**祝您发布顺利！** 🎉

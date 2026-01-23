# VocabMaster Android APK发布指南

本指南提供完整的步骤来打包您的Android项目为APK，并将其发布到GitHub Release。

## 前置条件

在开始之前，请确保您已安装：
- Android Studio (最新版本)
- Android SDK (API 30+)
- Java Development Kit (JDK 11+)
- Git

## 第一步：准备项目

### 1.1 生成签名密钥库（Keystore）

首先，您需要生成一个用于签名APK的密钥库。这个密钥库是安全的，请妥善保管。

```bash
cd /path/to/vocabmaster/android

# 生成密钥库文件
keytool -genkey -v -keystore vocabmaster-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias vocabmaster-key
```

执行上述命令后，系统将提示您输入：
- 密钥库密码（记住这个密码！）
- 密钥密码
- 您的个人信息（名字、城市等）

### 1.2 配置Gradle签名

编辑 `android/app/build.gradle`，在 `android` 块中添加以下内容：

```gradle
android {
    // 其他配置...

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

**重要**：将密码替换为您实际的密码。为了安全起见，也可以将密码存储在本地的 `local.properties` 文件中。

## 第二步：构建Web资源

由于这是一个Capacitor项目，需要先构建Web资源：

```bash
cd /path/to/vocabmaster

# 安装依赖
npm install

# 构建Web资源
npm run build

# 同步到Android项目
npx cap sync android
```

## 第三步：构建APK

### 3.1 使用Gradle命令构建

```bash
cd android

# 使用gradlew构建Release APK
./gradlew assembleRelease

# 或者，使用Gradle包装器的另一个方法
./gradlew clean assembleRelease
```

构建完成后，APK文件将位于：
```
android/app/build/outputs/apk/release/app-release.apk
```

### 3.2 使用Android Studio构建

1. 打开Android Studio
2. 点击菜单 `Build` → `Generate Signed Bundle/APK`
3. 选择 `APK`
4. 选择之前创建的密钥库文件
5. 输入密码
6. 选择 `release` 构建类型
7. 点击 `Finish`

## 第四步：测试APK

在发布之前，建议在实际设备或模拟器上测试APK：

```bash
# 使用adb安装APK
adb install android/app/build/outputs/apk/release/app-release.apk

# 或者使用gradlew
./gradlew installRelease
```

## 第五步：创建GitHub Release

### 5.1 准备Git仓库

```bash
# 确保所有更改已提交
git status
git add .
git commit -m "Release version 1.0.0"

# 创建版本标签
git tag -a v1.0.0 -m "VocabMaster Release v1.0.0"

# 推送到远程仓库
git push origin main
git push origin v1.0.0
```

### 5.2 在GitHub上创建Release

#### 方法A：使用GitHub CLI

```bash
# 首先，确保您已安装GitHub CLI并已登录
gh auth login

# 创建Release并上传APK
gh release create v1.0.0 \
  --title "VocabMaster v1.0.0" \
  --notes "Initial release of VocabMaster Android app" \
  android/app/build/outputs/apk/release/app-release.apk
```

#### 方法B：使用GitHub Web界面

1. 访问您的仓库页面
2. 点击右侧的 `Releases`
3. 点击 `Create a new release`
4. 填写版本标签和描述
5. 上传 `app-release.apk` 文件
6. 点击 `Publish release`

## 第六步：分享Release

现在您的APK已发布到GitHub，用户可以：
1. 访问您的仓库页面
2. 点击 `Releases`
3. 下载最新的 `app-release.apk` 文件

## 常见问题

### Q1: 如何更新版本号？

编辑 `android/app/build.gradle` 中的版本信息：

```gradle
defaultConfig {
    versionCode 2      // 内部版本号（必须递增）
    versionName "1.1"  // 用户可见版本号
}
```

### Q2: APK太大怎么办？

启用ProGuard代码混淆和资源压缩（已在上述配置中启用）：

```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### Q3: 如何查看构建日志？

```bash
./gradlew assembleRelease --info

# 或者检查构建输出
cat android/app/build/outputs/apk/release/output-metadata.json
```

### Q4: 忘记了密钥库密码怎么办？

不幸的是，如果密码丢失，您需要生成新的密钥库。这意味着后续版本将使用新的签名。

### Q5: 如何让用户自动接收更新？

可以集成Firebase App Distribution或使用其他分发平台。目前，用户需要从GitHub Release手动下载APK。

## 安全提示

1. **不要在版本控制中保存密钥库**：添加到 `.gitignore`
2. **不要在代码中暴露密码**：使用环境变量或本地配置
3. **定期备份密钥库**：这是您后续所有APK的唯一签名方式
4. **使用强密码**：至少8个字符，包含数字和特殊字符

## 故障排除

如果遇到问题，请检查：

1. **Java版本**：`java -version`（应该是JDK 11+）
2. **Android SDK**：在Android Studio中检查SDK Manager
3. **Gradle版本**：查看 `android/build.gradle` 中的gradle版本
4. **依赖冲突**：运行 `./gradlew dependencies` 来检查

## 下一步

- 设置CI/CD自动构建和发布（使用GitHub Actions）
- 配置Firebase Crashlytics来监控崩溃
- 发布到Google Play Store以获得更广泛的用户覆盖

## 参考资源

- [Android官方文档 - 签名您的应用](https://developer.android.com/studio/publish/app-signing)
- [Capacitor Android开发文档](https://capacitorjs.com/docs/android)
- [GitHub Release文档](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)

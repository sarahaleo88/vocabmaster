# VocabMaster - Android APK 构建与发布指南

## 快速开始 (两条命令搞定)

在终端中进入项目目录后，执行：

```bash
# 1. 构建 Release APK
./build-release-apk.sh

# 2. 发布到 GitHub
./publish-to-github.sh
```

---

## 详细步骤

### 前提条件

确保你的电脑已安装：

1. **Node.js** (v18+) - [下载地址](https://nodejs.org/)
2. **Android Studio** - [下载地址](https://developer.android.com/studio)
3. **Java JDK 17** - Android Studio 自带
4. **GitHub CLI** - [下载地址](https://cli.github.com/)

```bash
# macOS 安装 GitHub CLI
brew install gh

# 登录 GitHub
gh auth login
```

### 步骤 1: 构建 APK

```bash
cd ~/Desktop/vocabmaster/vocabmaster
./build-release-apk.sh
```

此脚本会自动完成：
- ✅ 安装 npm 依赖
- ✅ 构建 Web 资源 (vite build)
- ✅ 同步到 Android 项目 (capacitor sync)
- ✅ 生成签名密钥库 (如果不存在)
- ✅ 构建签名的 Release APK

构建完成后，APK 文件位于：
- `android/app/build/outputs/apk/release/app-release.apk`
- `VocabMaster-v1.0.0-release.apk` (复制到项目根目录)

### 步骤 2: 发布到 GitHub

```bash
./publish-to-github.sh
```

此脚本会自动完成：
- ✅ 创建 GitHub 仓库 (如果不存在)
- ✅ 推送代码
- ✅ 创建 Release
- ✅ 上传 APK 文件

---

## 手动操作 (可选)

如果你想手动执行各步骤：

### 1. 构建 Web 资源

```bash
cd ~/Desktop/vocabmaster/vocabmaster
npm install
npm run build
```

### 2. 同步到 Android

```bash
npx cap sync android
```

### 3. 生成签名密钥库

```bash
cd android
./generate-keystore.sh
mv vocabmaster-release.keystore app/
```

### 4. 构建 APK

```bash
cd android
./gradlew assembleRelease
```

### 5. 使用 Android Studio 构建

1. 打开 Android Studio
2. 选择 `Open` -> 选择 `vocabmaster/android` 目录
3. 等待 Gradle 同步完成
4. 菜单: `Build` -> `Generate Signed Bundle / APK`
5. 选择 `APK`
6. 选择密钥库文件 `app/vocabmaster-release.keystore`
7. 输入密码: `vocabmaster123`
8. 选择 `release` 构建类型
9. 点击 `Finish`

---

## 签名信息

| 项目 | 值 |
|------|-----|
| 密钥库文件 | `android/app/vocabmaster-release.keystore` |
| 密钥库密码 | `vocabmaster123` |
| 密钥别名 | `vocabmaster` |
| 密钥密码 | `vocabmaster123` |

⚠️ **重要**: 请妥善保管密钥库文件！如果丢失，你将无法更新已发布到应用商店的应用。

---

## 常见问题

### Q: 构建时提示 "SDK location not found"

在 Android Studio 中：
1. `File` -> `Project Structure` -> `SDK Location`
2. 设置正确的 Android SDK 路径

或创建 `android/local.properties` 文件：
```
sdk.dir=/Users/你的用户名/Library/Android/sdk
```

### Q: Gradle 下载很慢

设置代理：
```bash
export https_proxy=http://127.0.0.1:7890
export http_proxy=http://127.0.0.1:7890
```

### Q: gh 命令未找到

安装 GitHub CLI：
```bash
# macOS
brew install gh

# 然后登录
gh auth login
```

---

## 项目结构

```
vocabmaster/
├── src/                    # Web 源代码
├── dist/                   # 构建输出 (vite build)
├── android/                # Android 项目
│   ├── app/
│   │   ├── build.gradle    # 包含签名配置
│   │   └── vocabmaster-release.keystore
│   ├── generate-keystore.sh
│   └── gradlew
├── build-release-apk.sh    # 一键构建脚本
├── publish-to-github.sh    # 一键发布脚本
└── BUILD_AND_PUBLISH_GUIDE.md  # 本文档
```

---

## 版本更新

更新版本号时，需要修改：

1. `android/app/build.gradle`:
   ```groovy
   versionCode 2        // 每次发布递增
   versionName "1.1.0"  // 版本显示名称
   ```

2. `publish-to-github.sh`:
   ```bash
   VERSION="v1.1.0"
   APK_FILE="VocabMaster-v1.1.0-release.apk"
   ```

3. `build-release-apk.sh`:
   ```bash
   # 修改复制的文件名
   cp "$APK_PATH" "../VocabMaster-v1.1.0-release.apk"
   ```

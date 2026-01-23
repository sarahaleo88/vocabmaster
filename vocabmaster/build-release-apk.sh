#!/bin/bash

# VocabMaster - 一键构建 Release APK 脚本
# 此脚本会完成: Web构建 -> 同步到Android -> 生成签名APK

set -e  # 遇到错误立即退出

echo "=========================================="
echo "  VocabMaster Release APK 构建工具"
echo "=========================================="
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "错误: 未找到 npm，请先安装 npm"
    exit 1
fi

echo "步骤 1/5: 安装 npm 依赖..."
npm install

echo ""
echo "步骤 2/5: 构建 Web 资源..."
npm run build

echo ""
echo "步骤 3/5: 同步到 Android 项目..."
npx cap sync android

echo ""
echo "步骤 4/5: 生成签名密钥库 (如果不存在)..."
cd android/app
if [ ! -f "vocabmaster-release.keystore" ]; then
    echo "密钥库不存在，正在生成..."
    cd ..
    chmod +x generate-keystore.sh
    ./generate-keystore.sh
    mv vocabmaster-release.keystore app/
    cd app
else
    echo "密钥库已存在，跳过生成"
fi

echo ""
echo "步骤 5/5: 构建 Release APK..."
cd ..
chmod +x gradlew
./gradlew assembleRelease

# 检查构建结果
APK_PATH="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    echo ""
    echo "=========================================="
    echo "  构建成功!"
    echo "=========================================="
    echo ""
    echo "APK 文件位置:"
    echo "  $(pwd)/$APK_PATH"
    echo ""

    # 显示 APK 信息
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo "APK 大小: $APK_SIZE"
    echo ""

    # 复制到更容易找到的位置
    cp "$APK_PATH" "../VocabMaster-v1.0.0-release.apk"
    echo "已复制到: $(dirname $(pwd))/VocabMaster-v1.0.0-release.apk"
else
    echo ""
    echo "错误: 构建失败，未找到 APK 文件"
    exit 1
fi

#!/bin/bash

# VocabMaster - Setup Android Signing
# 配置Android签名密钥

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$PROJECT_ROOT/vocabmaster/android/app"

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}VocabMaster Android 签名密钥设置${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

# 检查keytool
if ! command -v keytool &> /dev/null; then
    echo -e "${RED}✗ 错误: 未找到keytool${NC}"
    echo "请确保您已安装Java Development Kit (JDK)"
    exit 1
fi

# 检查是否已存在密钥库
if [ -f "$ANDROID_DIR/vocabmaster-release-key.jks" ]; then
    echo -e "${YELLOW}⚠ 警告: 密钥库文件已存在${NC}"
    echo ""
    read -p "要覆盖现有密钥库吗? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "取消操作"
        exit 0
    fi
    rm "$ANDROID_DIR/vocabmaster-release-key.jks"
fi

echo "生成新的签名密钥库..."
echo ""
echo "请按照以下步骤操作："
echo "1. 输入密钥库密码（至少6个字符，记住这个密码！）"
echo "2. 重新输入密钥库密码"
echo "3. 输入您的个人信息（名字、城市等）"
echo "4. 输入密钥密码（通常与密钥库密码相同）"
echo ""

keytool -genkey -v -keystore "$ANDROID_DIR/vocabmaster-release-key.jks" \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias vocabmaster-key

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ 密钥库生成成功！${NC}"
    echo ""
    echo "密钥库路径: $ANDROID_DIR/vocabmaster-release-key.jks"
    echo ""
    echo "接下来的步骤："
    echo ""
    echo "1. 编辑 vocabmaster/android/app/build.gradle"
    echo "2. 在 'android' 块中添加签名配置（参考 ANDROID_RELEASE_GUIDE.md）"
    echo "3. 将您的密码输入到签名配置中"
    echo ""
    echo -e "${YELLOW}重要: 妥善保管这个密钥库文件！${NC}"
    echo "      如果丢失，您将无法更新现有的应用程序。"
    echo ""
else
    echo -e "${RED}✗ 密钥库生成失败${NC}"
    exit 1
fi

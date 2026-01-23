#!/bin/bash

# VocabMaster - 签名密钥库生成脚本
# 运行此脚本将生成用于签名 Release APK 的密钥库

KEYSTORE_FILE="vocabmaster-release.keystore"
KEYSTORE_PASSWORD="vocabmaster123"
KEY_ALIAS="vocabmaster"
KEY_PASSWORD="vocabmaster123"

echo "=========================================="
echo "  VocabMaster 签名密钥库生成工具"
echo "=========================================="
echo ""

# 检查是否已存在密钥库
if [ -f "$KEYSTORE_FILE" ]; then
    echo "警告: 密钥库文件已存在: $KEYSTORE_FILE"
    read -p "是否覆盖? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo "已取消"
        exit 0
    fi
    rm -f "$KEYSTORE_FILE"
fi

echo "正在生成密钥库..."
echo ""

# 生成密钥库
keytool -genkeypair \
    -v \
    -storetype PKCS12 \
    -keystore "$KEYSTORE_FILE" \
    -storepass "$KEYSTORE_PASSWORD" \
    -alias "$KEY_ALIAS" \
    -keypass "$KEY_PASSWORD" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -dname "CN=VocabMaster, OU=Development, O=VocabMaster, L=Beijing, ST=Beijing, C=CN"

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "  密钥库生成成功!"
    echo "=========================================="
    echo ""
    echo "密钥库文件: $KEYSTORE_FILE"
    echo "密钥库密码: $KEYSTORE_PASSWORD"
    echo "密钥别名:   $KEY_ALIAS"
    echo "密钥密码:   $KEY_PASSWORD"
    echo ""
    echo "重要: 请妥善保管此密钥库文件和密码!"
    echo "      如果丢失，将无法更新已发布的应用!"
    echo ""
else
    echo ""
    echo "错误: 密钥库生成失败"
    exit 1
fi

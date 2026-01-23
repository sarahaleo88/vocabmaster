#!/bin/bash

# VocabMaster Android Release Script
# 自动化构建和发布Android APK到GitHub

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$PROJECT_ROOT/vocabmaster/android"
APP_DIR="$ANDROID_DIR/app"
VERSION="${1:-1.0.0}"

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}VocabMaster Android Release Script${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "项目路径: $PROJECT_ROOT"
echo "版本: $VERSION"
echo ""

# 函数：打印错误并退出
error_exit() {
    echo -e "${RED}✗ 错误: $1${NC}"
    exit 1
}

# 函数：打印成功信息
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# 函数：打印信息
info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# 第一步：检查环境
echo "第一步：检查构建环境..."
command -v git >/dev/null 2>&1 || error_exit "未找到git"
command -v npm >/dev/null 2>&1 || error_exit "未找到npm"
success "Git和npm已安装"

# 第二步：检查签名密钥
echo ""
echo "第二步：检查签名配置..."
if [ ! -f "$ANDROID_DIR/app/vocabmaster-release-key.jks" ]; then
    error_exit "未找到签名密钥库 (vocabmaster-release-key.jks)"
fi
success "签名密钥库存在"

# 第三步：构建Web资源
echo ""
echo "第三步：构建Web资源..."
cd "$PROJECT_ROOT/vocabmaster"
info "安装依赖..."
npm ci >/dev/null 2>&1 || npm install >/dev/null 2>&1
success "依赖安装完成"

info "构建Web资源..."
npm run build >/dev/null 2>&1 || error_exit "Web构建失败"
success "Web资源构建完成"

# 第四步：同步Capacitor
echo ""
echo "第四步：同步Capacitor..."
info "同步到Android..."
npx cap sync android >/dev/null 2>&1 || error_exit "Capacitor同步失败"
success "Capacitor同步完成"

# 第五步：构建APK
echo ""
echo "第五步：构建APK..."
cd "$ANDROID_DIR"
info "清理旧构建..."
./gradlew clean >/dev/null 2>&1 || true
success "清理完成"

info "构建Release APK..."
./gradlew assembleRelease || error_exit "APK构建失败"
success "APK构建完成"

APK_PATH="$APP_DIR/build/outputs/apk/release/app-release.apk"
if [ ! -f "$APK_PATH" ]; then
    error_exit "APK文件未找到: $APK_PATH"
fi

APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
success "APK文件已生成 (大小: $APK_SIZE)"
echo "路径: $APK_PATH"

# 第六步：检查Git状态
echo ""
echo "第六步：检查Git状态..."
cd "$PROJECT_ROOT"
if [ -z "$(git status --porcelain)" ]; then
    success "工作区干净"
else
    info "有未提交的更改"
    git status --short
fi

# 第七步：提示后续操作
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}构建成功！${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "后续操作："
echo ""
echo "1. 测试APK（可选）:"
echo "   adb install \"$APK_PATH\""
echo ""
echo "2. 创建Git标签并推送:"
echo "   cd $PROJECT_ROOT"
echo "   git tag -a v$VERSION -m \"Release v$VERSION\""
echo "   git push origin main"
echo "   git push origin v$VERSION"
echo ""
echo "3. 创建GitHub Release:"
echo "   gh release create v$VERSION \\"
echo "     --title \"VocabMaster v$VERSION\" \\"
echo "     --notes \"VocabMaster Release v$VERSION\" \\"
echo "     \"$APK_PATH\""
echo ""
echo "或者访问: https://github.com/[your-username]/vocabmaster/releases/new"
echo ""

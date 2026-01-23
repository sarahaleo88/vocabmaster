#!/bin/bash

# VocabMaster - GitHub 发布脚本
# 此脚本会: 创建 GitHub 仓库 -> 推送代码 -> 创建 Release -> 上传 APK

set -e

echo "=========================================="
echo "  VocabMaster GitHub 发布工具"
echo "=========================================="
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 配置
REPO_NAME="vocabmaster"
VERSION="v1.0.0"
APK_FILE="VocabMaster-v1.0.0-release.apk"

# 检查 gh CLI
if ! command -v gh &> /dev/null; then
    echo "错误: 未找到 GitHub CLI (gh)"
    echo "请先安装: https://cli.github.com/"
    echo ""
    echo "macOS: brew install gh"
    echo "然后运行: gh auth login"
    exit 1
fi

# 检查是否已登录
if ! gh auth status &> /dev/null; then
    echo "请先登录 GitHub:"
    gh auth login
fi

# 检查 APK 文件
if [ ! -f "$APK_FILE" ]; then
    echo "错误: 未找到 APK 文件: $APK_FILE"
    echo "请先运行 ./build-release-apk.sh 构建 APK"
    exit 1
fi

echo "步骤 1/4: 检查/创建 GitHub 仓库..."

# 获取当前用户名
GH_USER=$(gh api user -q .login)
echo "GitHub 用户: $GH_USER"

# 检查仓库是否存在
if gh repo view "$GH_USER/$REPO_NAME" &> /dev/null; then
    echo "仓库已存在: $GH_USER/$REPO_NAME"
else
    echo "创建新仓库: $GH_USER/$REPO_NAME"
    gh repo create "$REPO_NAME" --public --description "VocabMaster - 智能词汇学习应用"
fi

echo ""
echo "步骤 2/4: 初始化 Git 并推送代码..."

# 初始化 Git (如果当前目录没有 .git)
if [ ! -d ".git" ]; then
    # 检查是否在子目录中，父目录有 .git
    if [ -d "../.git" ]; then
        echo "检测到 Git 仓库在父目录，切换到父目录操作..."
        cd ..
        APK_FILE="vocabmaster/$APK_FILE"
    else
        git init
        git add .
        git commit -m "Initial commit: VocabMaster v1.0.0"
    fi
fi

# 确保所有更改已提交
git add -A
git diff --cached --quiet || git commit -m "Release: VocabMaster v1.0.0"

# 设置远程仓库
if ! git remote get-url origin &> /dev/null; then
    git remote add origin "https://github.com/$GH_USER/$REPO_NAME.git"
else
    # 更新远程 URL
    git remote set-url origin "https://github.com/$GH_USER/$REPO_NAME.git"
fi

# 获取当前分支名
CURRENT_BRANCH=$(git branch --show-current)
if [ -z "$CURRENT_BRANCH" ]; then
    CURRENT_BRANCH="main"
    git branch -M main
fi

echo "当前分支: $CURRENT_BRANCH"

# 推送代码
git push -u origin "$CURRENT_BRANCH" || {
    echo "首次推送，设置上游分支..."
    git push --set-upstream origin "$CURRENT_BRANCH"
}

echo ""
echo "步骤 3/4: 创建 Release..."

# 检查是否已有此版本的 release
if gh release view "$VERSION" --repo "$GH_USER/$REPO_NAME" &> /dev/null; then
    echo "Release $VERSION 已存在，删除后重新创建..."
    gh release delete "$VERSION" --repo "$GH_USER/$REPO_NAME" --yes
fi

# 创建 Release
gh release create "$VERSION" \
    --repo "$GH_USER/$REPO_NAME" \
    --title "VocabMaster $VERSION" \
    --notes "## VocabMaster $VERSION 发布

### 新功能
- 首次发布
- 智能词汇学习功能
- 离线支持

### 安装说明
1. 下载 \`VocabMaster-v1.0.0-release.apk\`
2. 在 Android 设备上打开 APK 文件
3. 允许安装未知来源应用
4. 完成安装

### 系统要求
- Android 5.0 (API 21) 或更高版本
"

echo ""
echo "步骤 4/4: 上传 APK 到 Release..."

gh release upload "$VERSION" "$APK_FILE" --repo "$GH_USER/$REPO_NAME" --clobber

echo ""
echo "=========================================="
echo "  发布成功!"
echo "=========================================="
echo ""
echo "GitHub 仓库: https://github.com/$GH_USER/$REPO_NAME"
echo "Release 页面: https://github.com/$GH_USER/$REPO_NAME/releases/tag/$VERSION"
echo "APK 下载链接: https://github.com/$GH_USER/$REPO_NAME/releases/download/$VERSION/VocabMaster-v1.0.0-release.apk"
echo ""

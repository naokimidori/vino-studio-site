#!/bin/bash

# =================================================================
# Vino Studio 自动部署脚本
# =================================================================

# 配置信息
SERVER_IP="47.253.128.249"
SERVER_USER="root"
REMOTE_PATH="/var/www/vino-studio-site"

echo "🚀 开始部署流程..."

# 1. 执行构建
echo "🧹 正在清理旧的构建文件 (rm -rf ./dist)..."
rm -rf ./dist

echo "📦 正在执行本地构建 (npm run build)..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败，请检查代码错误。"
    exit 1
fi

echo "✅ 构建完成。"

# 2. 准备远程目录
echo "📂 正在确认服务器目录是否存在..."
ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${REMOTE_PATH}"

# 3. 上传文件
echo "⬆️ 正在通过 rsync 同步文件到服务器..."
# 使用 rsync 增量同步，--delete 确保远程和本地完全一致
rsync -avz --delete ./dist/ ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/

if [ $? -eq 0 ]; then
    echo "--------------------------------------------------"
    echo "🎉 部署成功！"
    echo "🔗 访问地址: https://vinoz.tech"
    echo "--------------------------------------------------"
    echo "⚠️  注意：如果是首次部署，请确保服务器已安装 Nginx"
    echo "并配置 root 路径为: ${REMOTE_PATH}"
else
    echo "❌ 文件上传失败，请检查网络、端口或 SSH 密码。"
fi

# cacheをクリア
npm cache clear --force

# @ninjagl/coreの最新版を取得
pnpm install @ninjagl/core@latest

# 依存パッケージをインストール
pnpm install

docker-compose build --no-cache
docker-compose up -d
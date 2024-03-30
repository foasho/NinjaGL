# pnpm installを行い、lockを更新後、docker-compose buildとupを行う
pnpm install
docker-compose build
docker-compose up -d
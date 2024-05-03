<div align="center">
<img src="https://github.com/foasho/NinjaGL/assets/57359515/e7d4f979-c2af-4f2b-8bf4-53a8e9696a43" width="200" />

# NinjaGL Web First GameEngine🎮

[Starter Scene](https://github.com/foasho/NinjaGL/assets/57359515/924347bd-9a8a-4f4b-b186-e2142796f608
)

[デモ](https://ninjagl.vercel.app) | [ドキュメント](https://ninjagl.vercel.app/docs) | [チュートリアル](https://ninjagl.vercel.app/docs/tutorial)

NinjaGLは、[ReactThreeFiber](https://github.com/pmndrs/react-three-fiber)のリソースを活用して制作されたゲームエンジンです。

## ショーケース

(準備中)

</div>
- [Gellery](https://ninjagl.vercel.app/gallery)

</div>

## 特徴🌴
* Reactに統合可能なゲームエンジン🚀
* Skywayを使用したマルチプレイヤー対応👥
* モバイル | PC | ゲームパッド 複数の操作に対応📱
* [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh)に活用した高速な物理エンジン💥
* javascriptでのゲーム動作を自由に記述🤖

### ビルドファイルをReactで読み込み💡

```bash
npm install @ninjagl/core
```

```tsx
import { NinjaGL } from "@ninjagl/core";

function App() {
  return (
    <div style={{ height: "100vh" }}>
      <NinjaGL njcPath={"/your-file.njc"} />
    </div>
  );
}
```

### ストレージ
- Vercel Blob
- クライアント / サーバーアップロードの選択

**.env**の指定
※ Client Uploadはhttpsでの通信のみ使用できます。
```
# client upload
NEXT_PUBLIC_UPLOAD_TYPE="client"

$ server upload
NEXT_PUBLIC_UPLOAD_TYPE="server"
```

### DBマイグレーション💾
- Vercel Blob

```bash
pnpm run db:generate
pnpm run db:push
```

- [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)
- [Drizzle Kit CMD](https://orm.drizzle.team/kit-docs/commands)

### WSL on Docker

```bash
cp .env.example.docker .env
```

#### Packages Update

[NVMのInstall](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)

```
nvm install 20.12.2
nvm use 20.12.2
npm install -g pnpm
chmod +x update.sh
./update.sh
```

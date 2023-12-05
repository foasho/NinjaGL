
<div align="center">
<img src="https://storage.googleapis.com/zenn-user-upload/c7e16c8c0654-20231205.png" width="200" />

# NinjaGL Web First GameEngine
[デモ](https://ninjagl.vercel.app) | [ドキュメント](https://ninjagl.vercel.app/docs) | [チュートリアル](https://ninjagl.vercel.app/docs/tutorial)

NinjaGLは、[ReactThreeFiber](https://github.com/pmndrs/react-three-fiber)のリソースを活用して制作されたゲームエンジンです。

## ショーケース
(準備中)

## 特徴
* Reactに統合可能なゲームエンジン
* マルチプレイヤー対応
* モバイル | PC | ゲームパッド 複数の操作に対応
* [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh)に活用した高速な物理エンジン
* javascriptでのゲーム動作を自由に記述

### ビルドファイルをReactで読み込み

```bash
npm install @ninjagl/core
```

```tsx
import { NinjaGL } from '@ninjagl/core';

function App() {
  return (
    <div style={{ height: "100vh" }}>
      <NinjaGL njcPath={'/your-file.njc'} />
    </div>
  );
}
```

### ゲームエンジンをクローンするとき

VercelBlobをStorageに使用しています。
- 4.5MB より小さいファイルしかアップロードできない。
- next.config.js を各自の環境に合わせて設定する

```
images: {
    remotePatterns: [
      {
        protocol: 'https',
        // Rewrite your self domain to your Vercel domain
        hostname: '<YOUR_URL>.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  }
```

</div>
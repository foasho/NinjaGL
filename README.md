# NinjaGL

- React18
- Three.js
- ReactThreeFiber

デモページ


## Web上で高速な3Dゲームを作るためのゲームエンジン

![バナー画像](https://i.pinimg.com/originals/5c/14/67/5c1467dfa20d49a540151e8cad805761.png)

## 構成
- NinjaEditor: 汎用ゲームエンジンライクなUIの制作用エディタ
- NinjaCore: エディタで作成した3DコンテンツをReact上のコンポネント組み込めるCoreライブラリ

## 使い方(USAGE)
### Editorごと使いたい時
```:commandline
git clone https://github.com/foasho/NinjaGL.git
cd NinjaGL
pnpm install
pnpm run dev
```

### Editorで作ったものを組み込みたいとき
```
npm install @ninjagl/core
```

```tsx
import { NinjaGL } from "@ninjagl/core";

function App() {
  return (
    <div>
      <NinjaGL njcPath={"/example.njc"}/>
    </div>
  )
}
```


## 機能

### 直感的なメインビュー
- UnrealEngineライクに作成しています。


### すぐに確認できるプレイビュー

### 好きな地形をさくっと作れる地形メーカー

### おなじみのスクリプトエディタ


### 高級表現のシェーダエディタ
(調整中)

## 高速化の工夫

### 自動スケーリング
(調整中)

### 独自の物理エンジン
複雑な数値計算をしない高級すぎない物理エンジン
(調整中)

### LODの自動化
(調整中)

### カメラのレイヤー
(調整中)


## 使用ライセンス
MITライセンスに準じます。(LICENSE.txt)
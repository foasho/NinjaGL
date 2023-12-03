# Scirptエディタの使い方

## 初期コード

```js
/**
 *  呼び出し時
 */
async function initialize() {
  // your code
}

/**
 * 毎フレーム事の処理
 * @param state: { elapsedTime: 経過時間, mouse: { x, y } }
 * @param delta: 1フレーム時間(秒) ex)0.016
 * @param input: 
 *  { 
 *    forward: boolean, 
 *    backward: boolean, 
 *    left: boolean, 
 *    right: boolean, 
 *    jump: boolean, 
 *    dash: boolean, 
 *    actio: boolean, 
 *    pressedKeys: [] 
 * }
 */
async function frameLoop(state, delta, input) {
  // your code
}
```

## 関数の説明

### initialize
- **説明**: アプリケーションが起動された際に最初に実行される初期化関数です。この関数はアプリケーションのセットアップや初期設定のために使用されます。
- **パラメータ**: なし
- **備考**: この関数はアプリケーションのライフサイクルで一度だけ呼び出されます。

### frameLoop
- **説明**: この関数はアプリケーションのメインループ内で毎フレーム実行されます。ゲームの更新処理や描画処理を行うために使用されます。
- **パラメータ**:
  - `state`: ゲームやアプリケーションの状態を含むオブジェクト。以下のプロパティを含みます:
    - `elapsedTime`: 経過時間 (アプリケーションの開始からの時間)
    - `mouse`: マウスの位置を表すオブジェクト。`x`, `y` の座標を持ちます。
  - `delta`: 1フレームの時間（秒単位）。例: `0.016`
  - `input`: ユーザー入力を表すオブジェクト。以下のプロパティを含みます:
    - `forward`: 前進（`boolean`）
    - `backward`: 後退（`boolean`）
    - `left`: 左移動（`boolean`）
    - `right`: 右移動（`boolean`）
    - `jump`: ジャンプ（`boolean`）
    - `dash`: ダッシュ（`boolean`）
    - `action`: アクション（`boolean`）
    - `pressedKeys`: 押されているキーの配列
- **備考**: この関数はゲームのロジックやアニメーションの更新、ユーザー入力の処理など、フレーム毎の処理を担います。




## Transformの移動
### Position操作サンプル
```js
async function initialize() {
}

async function frameLoop(state, delta, input) {
  const om = await getOMByName({name: "<YourObjectName>"});
  const { x, y, z } = om.args.position;
  if (x + 0.01 < 10){
    await setPosition({id: om.id, position: [x+0.01, y, z]});
  }
}  
```

### Rotation操作サンプル
```js
async function initialize() {
}

async function frameLoop(state, delta, input) {
  const om = await getOMByName({name: "<YourObjectName>"});
  const { x, y, z } = om.args.rotation;
  const time = state.elapsedTime;
  // Y軸を時間で回転
  await setRotation({id: om.id, rotation: [x, Math.sin(time)* 2 * Math.PI, z]});
}
```

### Scale操作サンプル
```js
async function initialize() {
}

async function frameLoop(state, delta, input) {
    const om = await getOMByName({name: "<YourObjectName>"});
  const { x, y, z } = om.args.scale;
  const time = state.elapsedTime;
  // 0.5 ~ 1.5 倍の拡縮
  const s = 0.5 * Math.sin(time)
  await setScale({id: om.id, rotation: [1 + s, 1 + s, 1 + s]});
}
```

### 新しいオブジェクト追加

```js
async function initialize() {
}

async function frameLoop(state, delta, input) {
  if (input.action){
    // Boxオブジェクトの追加
    NW.addOM({
      type: "three",
      args: {
        position: [0, 1, 0],
        materialData: {
          type: "standard",
          value: "#4785FF",
        },
      }
    });
  }
}
```
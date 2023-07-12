# @ninjagl/coreライブラリ

## 主な依存関係
- three
- @react-three/fiber
- @react-three/drei
- @react-three/xr
- @react-three/postprocessing

### ShowCaseの実行
```
npm run showcase
```


## オブジェクト種別(OM)

### 共通パラメータ

| 名前 | システム名 | 説明 | デフォルト値 | 備考 |
| -- | -- | -- | -- | -- |
| ID | id |  | UUIDv4に基づく | -- |
| 名前 | name | | | -- |
| 種別 | type | オブジェクト種別 | | -- |
| レイヤ番号 | layerNum| カメラレイヤーに紐づく番号 | | -- |



### オブジェクト別argsパラメータ

| 名前 | 種別名 | パラメーター | 型 | 説明 |  |
| -- | -- | -- | -- | -- | -- |
| 汎用オブジェクト | object | position<br>rotation<br>scale<br>castShadow<br>recieveShadow<br>MaterialData<br>dafaultAnimation<br>visible<br>||||
import { EngineInstance } from "./EngineInstance";
import { Web3Instance } from "./Web3Instance";
import { userData } from "./UserDataStore";
import { MathUtils } from "three";

const id = MathUtils.generateUUID();
 
/**
 * 呼び出し時の処理
 */
async function initialize() {
  // ここに初期化処理を記述する
  const address = Web3Instance.getWalletAddress();
  userData.set("address", address);
  console.log(userData.get("address"));
}

/**
 * フレーム事の処理
 */
async function frameLoop(state, delta) {
  const object = EngineInstance.getObjectById("id");
  console.log(object);
}

/**
 * グローバルスコープ化
 * ※実際にScirptEditor上では、この記述はしない
 */
self[`${id}`].initialize = initialize;
self[`${id}`].frameLoop = frameLoop;
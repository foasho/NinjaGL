/**
 * ユーザースクリプトに対し、WebWorker実行クラスにマッパする
 */
self.onmessage = async function(event) {
  if (event.data.type === "RUN_SCRIPT") {
    await initialize();
    const state = {}; // ユーザーが定義するべき状態オブジェクト
    const delta = 0; // ユーザーが定義するべきデルタ値
    await frameLoop(state, delta);
  }
};
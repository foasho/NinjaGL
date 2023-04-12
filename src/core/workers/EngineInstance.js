/**
 * EngineCore内の基本操作Workerクラス
 */
export class EngineInstance {
  constructor(worker) {
    this.worker = worker;
  }

  getObjectById(id) {
    this.worker.postMessage({ type: "GET_OBJECT_BY_ID", payload: { id } });
  }

  getObjectByName(name) {
    this.worker.postMessage({ type: "GET_OBJECT_BY_NAME", payload: { name } });
  }

  setPosition(id, position) {
    this.worker.postMessage({
      type: "SET_POSITION",
      payload: { id, position: { x: position.x, y: position.y, z: position.z } }
    });
  }

  addEventListener(event, callback) {
    this.worker.addEventListener(event, callback);
  }
}
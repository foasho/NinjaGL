import { SkinnedMesh } from "three";
import { NinjaEngine } from "./NinjaEngineManager";
import { IInputMovement, IScriptManagement } from "./utils/NinjaProps";
import { RootState } from "@react-three/fiber";

declare var self: any;
declare var window: any;
declare global {
  interface Window {
    // EngineInstance: EngineInstance;
  }
}

/**
 * NinjaEngineから呼び出されるWorker
 */
export class NinjaEngineWorker {
  ThreeJSVer: string = "0.149.0";
  engine: NinjaEngine;
  worker: Worker | undefined;
  constructor(engine: NinjaEngine) {
    this.engine = engine;
  }

  /**
   * ユーザースクリプトを読み込む
   */
  public async loadUserScript(sms: IScriptManagement[]): Promise<void> {
    const importScriptsCode = sms.filter((sm) => sm.script)
      .map(
        (sm) => `
        (function(id) {
          ${sm.script}
          self[id] = {
            initialize: initialize,
            frameLoop: frameLoop,
          };
        })('${sm.id}');
      `
      )
      .join("\n");

    const threeCDN = `https://unpkg.com/three@${this.ThreeJSVer}/build/three.min.js`;

    const workerScript = `
      // Add ThreeJS
      importScripts("${threeCDN}");


      // Add UserScripts
      ${importScriptsCode}

      // Avairable UserData
      let UserData = {};

      self.addEventListener("message", (event) => {
        const { type, id, state, delta, input, data, messageId } = event.data;
        if (type === "runInitialize") {
          if (self[id] && typeof self[id].initialize === "function") {
            self[id].initialize();
          } else {
            console.error('Initialize function for id not found.');
          }
        } else if (type === "runFrameLoop") {
          if (self[id] && typeof self[id].frameLoop === "function") {
            self[id].frameLoop(state, delta, input);
          } else {
            console.error('FrameLoop function for id "" not found.');
          }
        }
        else {
          if (type === "response") {
            const handler = responseHandlers.get(messageId);
            if (handler) {
              handler(data);
              responseHandlers.delete(messageId);
            }
          }
        }
      });

      // Count Request ID
      let messageIdCounter = 0;
      let responseHandlers = new Map();

      // Requset Message
      async function Request(type, data) {
        return new Promise((resolve) => {
          const messageId = this.messageIdCounter++;
          responseHandlers.set(messageId, resolve);
          self.postMessage({ type, data, messageId });
        });
      }

    `;

    const userScriptBlob = new Blob([`${workerScript}`], {
      type: "application/javascript",
    });

    const userScriptURL = URL.createObjectURL(userScriptBlob);
    this.worker = new Worker(userScriptURL);
    this.worker.addEventListener("message", this.handleWorkerMessage.bind(this));
  }

  /**
   * Engine側から、
   * 任意のIDスクリプトをもつユーザースクリプトのinitialize関数を実行する
   * @param id 
   */
  public runInitialize(id: string): void {
    if (this.worker) {
      this.worker.postMessage({ type: "runInitialize", id: id });
    } else {
      console.error("Worker is not initialized yet.");
    }
  }

  /**
   * Engine側から、
   * 任意のIDスクリプトをもつユーザースクリプトのframeLoop関数を実行する
   * @param id 
   * @param state 
   * @param delta 
   * @param input
   */
  public runFrameLoop = (
    id: string, 
    state: RootState, 
    delta: number,
    input: IInputMovement
  ): void => {
    if (this.worker) {
      const _state = { elapsedTime: state.clock.getElapsedTime(), mouse: state.mouse }
      this.worker.postMessage({ 
        type: "runFrameLoop", 
        id: id, 
        state: _state, 
        delta: delta,
        input: input
       });
    } else {
      console.error("Worker is not initialized yet.");
    }
  }

  /**
   * WebWorkerのメッセージを処理する
   * @abstract self.postMessage: メインスレッドにメッセージを送信する
   * @abstract self.worker.postMessage: Workerにメッセージを送信する
   */
  handleWorkerMessage = async (e: MessageEvent) => {
    if (!this.worker) {
      return;
    }
    const { type, data, messageId } = e.data;
    if (type == "getPositionByName"){
      // 特定の名前のOMの位置を取得する
      const { name } = data;
      const om = this.engine.getOMByName(name);
      if (om) {
        this.worker.postMessage({ type: "response", data: om.object.position, messageId: messageId });
      }
      else {
        console.error(`Name: ${name}, OM not found.`);
        this.worker.postMessage({ type: "response", data: null, messageId: messageId });
      }
    }
    else if (type == "getRotationByName"){
      // 特定の名前のOMの回転を取得する
      const { name } = data;
      const om = this.engine.getOMByName(name);
      if (om) {
        this.worker.postMessage({ type: "response", data: om.object.rotation, messageId: messageId });
      }
      else {
        console.error(`Name: ${name}, OM not found.`);
        this.worker.postMessage({ type: "response", data: null, messageId: messageId });
      }
    }
    else if (type == "getScaleByName"){
      // 特定の名前のOMのスケールを取得する
      const { name } = data;
      const om = this.engine.getOMByName(name);
      if (om) {
        this.worker.postMessage({ type: "response", data: om.object.scale, messageId: messageId });
      }
      else {
        console.error(`Name: ${name}, OM not found.`);
        this.worker.postMessage({ type: "response", data: null, messageId: messageId });
      }
    }
    else if (type == "setPositionByName"){
      // 特定の名前のOMの位置を設定する
      const { name, position } = data;
      const om = this.engine.getOMByName(name);
      if (om) {
        om.object.position.copy(position);
        this.worker.postMessage({ type: "response", data: null, messageId: messageId });
      }
      else {
        console.error(`Name: ${name}, OM not found.`);
        this.worker.postMessage({ type: "response", data: null, messageId: messageId });
      }
    }
    else if (type == "setRotationByName"){
      // 特定の名前のOMの回転を設定する
      const { name, rotation } = data;
      const om = this.engine.getOMByName(name);
      if (om) {
        om.object.rotation.copy(rotation);
        this.worker.postMessage({ type: "response", data: null, messageId: messageId });
      }
      else {
        console.error(`Name: ${name}, OM not found.`);
        this.worker.postMessage({ type: "response", data: null, messageId: messageId });
      }
    }
    else if (type == "setScaleByName"){
      // 特定の名前のOMのスケールを設定する
      const { name, scale } = data;
      const om = this.engine.getOMByName(name);
      if (om) {
        om.object.scale.copy(scale);
        this.worker.postMessage({ type: "response", data: null, messageId: messageId });
      }
      else {
        console.error(`Name: ${name}, OM not found.`);
        this.worker.postMessage({ type: "response", data: null, messageId: messageId });
      }
    }
  }

}
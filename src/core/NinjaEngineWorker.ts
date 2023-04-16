import { SkinnedMesh } from "three";
import { NinjaEngine } from "./NinjaEngineManager";
import { IScriptManagement } from "./utils/NinjaProps";
import { Web3Instance } from "./workers/Web3Instance";
import { EngineInstance } from "./workers/EngineInstance";

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
  engine: NinjaEngine;
  worker: Worker | undefined;
  engineInstance: EngineInstance | undefined;
  constructor(engine: NinjaEngine) {
    this.engine = engine;
    (window as any).EngineInstance = new EngineInstance();
    this.engineInstance = (window as any).EngineInstance;
    this.engineInstance = self.EngineInstance;
    // self.addEventListener("message", this.handleWorkerMessage.bind(this));
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

    const workerScript = `

      // Add UserScripts
      ${importScriptsCode}

      self.addEventListener("message", (event) => {
        const { type, id, state, delta, data, messageId } = event.data;
        if (type === "runInitialize") {
          if (self[id] && typeof self[id].initialize === "function") {
            self[id].initialize();
          } else {
            console.error('Initialize function for id not found.');
          }
        } else if (type === "runFrameLoop") {
          if (self[id] && typeof self[id].frameLoop === "function") {
            self[id].frameLoop(state, delta);
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
   */
  public runFrameLoop = (id: string, state: any, delta: number): void => {
    if (this.worker) {
      this.worker.postMessage({ type: "runFrameLoop", id: id, state: state, delta: delta });
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
        console.error("OM not found.");
        this.worker.postMessage({ type: "response", data: null, messageId: messageId });
      }
    }
  }

}
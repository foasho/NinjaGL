import { RootState } from '@react-three/fiber';
import * as React from 'react';
import { IInputMovement, IScriptManagement } from 'utils';
import { NinjaEngineContext } from './useNinjaEngine';

interface NWorkerProps {
  ThreeJSVer: string;
}
export interface NWorkerProp {
  loadUserScript: (sms: IScriptManagement[]) => Promise<void>;
  runInitialize: (id: string) => void;
  runFrameLoop: (id: string, state: RootState, delta: number, input: IInputMovement) => void;
}
export const useNinjaWorker = ({
  ThreeJSVer,
}: NWorkerProps): NWorkerProp => {

  const engine = React.useContext(NinjaEngineContext);
  const worker = React.useRef<Worker|null>(null);

  const loadUserScript = async (sms: IScriptManagement[]): Promise<void> => {
    if (worker.current) return; // 既にWorkerが存在する場合は処理を終了する
    // IDに紐づく関数を作成する
    const importScriptsCode = sms.filter((sm) => sm.script).map(
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
    .join('\n');
    const threeCDN = `https://unpkg.com/three@${ThreeJSVer}/build/three.min.js`;
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
    worker.current = new Worker(userScriptURL);
    worker.current.addEventListener("message", handleWorkerMessage);

  }

    /**
   * Engine側から、
   * 任意のIDスクリプトをもつユーザースクリプトのinitialize関数を実行する
   * @param id 
   */
  const runInitialize = (id: string): void => {
    if (worker.current) {
      worker.current.postMessage({ type: "runInitialize", id: id });
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
  const runFrameLoop = (
    id: string, 
    state: RootState, 
    delta: number,
    input: IInputMovement
  ): void => {
    if (worker.current) {
      const _state = { elapsedTime: state.clock.getElapsedTime(), mouse: state.mouse }
      worker.current.postMessage({ 
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
   * WebWorkerメッセージを処理する
   */
  const handleWorkerMessage = async (e: MessageEvent) => {
    if (!worker.current) return;
    const { type, data, messageId } = e.data;
    if (type === "getPositionByName"){
      // 特定の名前のOMの位置を取得する
      const { name } = data as { name: string };
      const om = engine.getOMByName(name);
      if (om && om.object) {
        worker.current.postMessage({ type: "response", data: om.object.position, messageId: messageId });
      }
      else {
        console.error(`Name: ${name}, OM not found.`);
        worker.current.postMessage({ type: "response", data: null, messageId: messageId });
      }
    }
    else if (type === "getPositionByName"){
      // 特定の名前のOMの回転を取得する
      const { name } = data;
      const om = engine.getOMByName(name);
      if (om && om.object) {
        worker.current.postMessage({ type: "response", data: om.object.rotation, messageId: messageId });
      }
      else {
        console.error(`Name: ${name}, OM not found.`);
        worker.current.postMessage({ type: "response", data: null, messageId: messageId });
      }
    }
    else if (type == "getScaleByName"){
      // 特定の名前のOMのスケールを取得する
      const { name } = data;
      const om = engine.getOMByName(name);
      if (om && om.object) {
        worker.current.postMessage({ type: "response", data: om.object.scale, messageId: messageId });
      }
      else {
        console.error(`Name: ${name}, OM not found.`);
        worker.current.postMessage({ type: "response", data: null, messageId: messageId });
      }
    }
    else if (type == "setPositionByName"){
      // 特定の名前のOMの位置を設定する
      const { name, position } = data;
      const om = engine.getOMByName(name);
      if (om && om.object) {
        om.object.position.copy(position);
        worker.current.postMessage({ type: "response", data: null, messageId: messageId });
      }
      else {
        console.error(`Name: ${name}, OM not found.`);
        worker.current.postMessage({ type: "response", data: null, messageId: messageId });
      }
    }
    else if (type == "setRotationByName"){
      // 特定の名前のOMの回転を設定する
      const { name, rotation } = data;
      const om = engine.getOMByName(name);
      if (om && om.object) {
        om.object.rotation.copy(rotation);
        worker.current.postMessage({ type: "response", data: null, messageId: messageId });
      }
      else {
        console.error(`Name: ${name}, OM not found.`);
        worker.current.postMessage({ type: "response", data: null, messageId: messageId });
      }
    }
    else if (type == "setScaleByName"){
      // 特定の名前のOMのスケールを設定する
      const { name, scale } = data;
      const om = engine.getOMByName(name);
      if (om && om.object) {
        om.object.scale.copy(scale);
        worker.current.postMessage({ type: "response", data: null, messageId: messageId });
      }
      else {
        console.error(`Name: ${name}, OM not found.`);
        worker.current.postMessage({ type: "response", data: null, messageId: messageId });
      }
    }
  }

  return (
    {
      loadUserScript,
      runInitialize,
      runFrameLoop,
    }
  )
}
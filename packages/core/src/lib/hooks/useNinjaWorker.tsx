import { RootState } from "@react-three/fiber";
import React, { useContext, createContext } from "react";
import {
  ConvPos,
  ConvRot,
  ConvScale,
  IInputMovement,
  IScriptManagement,
  IObjectManagement,
  OMArgs2Obj,
} from "../utils";
import { useNinjaEngine } from "./useNinjaEngine";
import { InitOM } from "../utils";
import { Euler } from "three";
import { useNinjaKVS } from "./useKVS";

// scriptで扱う送信データ
const SD = {
  getOMByName: "getOMByName",
  setPosition: "setPosition",
  setRotation: "setRotation",
  setScale: "setScale",
  setArg: "setArg",
  addOM: "addOM",
  getKVS: "getKVS",
  createKVS: "createKVS",
  updateKVS: "updateKVS",
  removeKVS: "removeKVS",
};

interface NWorkerProviderProps {
  ThreeJSVer: string;
  children: React.ReactNode;
}

export interface NWorkerProp {
  worker: React.MutableRefObject<Worker | null>;
  loadUserScript: (sms: IScriptManagement[]) => Promise<void>;
  runInitialize: (id: string) => void;
  runFrameLoop: (
    id: string,
    state: RootState,
    delta: number,
    input: IInputMovement
  ) => void;
}
export const NinjaWorkerContext = createContext<NWorkerProp>({
  worker: { current: null },
  loadUserScript: async () => {},
  runInitialize: () => {},
  runFrameLoop: () => {},
});
export const useNinjaWorker = (): NWorkerProp => useContext(NinjaWorkerContext);

export const NinjaWorkerProvider = ({
  ThreeJSVer,
  children,
}: NWorkerProviderProps) => {
  const engine = useNinjaEngine();
  const { getKVS, createKVS, updateKVS, removeKVS } = useNinjaKVS();
  const worker = React.useRef<Worker | null>(null);
  const bugScriptListIds = React.useRef<string[]>([]);

  const loadUserScript = async (sms: IScriptManagement[]): Promise<void> => {
    if (worker.current) return; // 既にWorkerが存在する場合は処理を終了する
    // IDに紐づく関数を作成する
    const importScriptsCode = sms
      .filter((sm) => sm.script)
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
    const threeCDN = `https://unpkg.com/three@${ThreeJSVer}/build/three.min.js`;
    const workerScript = `
      // Add ThreeJS
      importScripts("${threeCDN}");

      // SCRIPTS_DATAのプロパティに対応する関数を作成する
      ${Object.keys(SD)
        .map(
          (key) => `
          const ${key} = async (data) => {
            return await req('${key}', data);
          }
        `
        )
        .join("")}

      // Add UserScripts
      ${importScriptsCode}

      // Avairable UserData
      let UserData = {};

      // ClickEventListener
      const clickEventListeners = {};
      const useClickEvent = (id, callback) => {
        if (clickEventListeners[id]) {
          clickEventListeners[id].push(callback);
        } else {
          clickEventListeners[id] = [callback];
        }
      };

      // DoubleClickEventListener
      const dblclickEventListeners = {};
      const useDblclickEvent = (id, callback) => {
        if (dblclickEventListeners[id]) {
          dblclickEventListeners[id].push(callback);
        } else {
          dblclickEventListeners[id] = [callback];
        }
      };

      // HoverEventListener
      const hoverEventListeners = {};
      const useHoverEvent = (id, callback) => {
        if (hoverEventListeners[id]) {
          hoverEventListeners[id].push(callback);
        } else {
          hoverEventListeners[id] = [callback];
        }
      };

      self.addEventListener("message", (event) => {
        // self.postMessage({ log: "Worker received message: " + event.data });
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
        else if (type === "click") {
          const callbacks = clickEventListeners[id];
          if (callbacks) {
            callbacks.forEach((callback) => {
              callback();
            });
          }
        }
        else if (type === "dblclick") {
          const callbacks = dblclickEventListeners[id];
          if (callbacks) {
            callbacks.forEach((callback) => {
              callback();
            });
          }
        }
        else if (type === "hover") {
          const callbacks = hoverEventListeners[id];
          if (callbacks) {
            callbacks.forEach((callback) => {
              callback();
            });
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
      const req = async (type, data) => {
        return new Promise((resolve) => {
          const messageId = messageIdCounter++;
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
    console.info("Worker is initialized.");
  };

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
  };

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
    // bugScriptListIdsにidが含まれている場合は、処理を終了する
    if (bugScriptListIds.current.includes(id)) {
      return;
    }
    if (worker.current) {
      const _state = {
        elapsedTime: state.clock.getElapsedTime(),
        mouse: state.mouse,
      };
      try {
        worker.current.postMessage({
          type: "runFrameLoop",
          id: id,
          state: _state,
          delta: delta,
          input: input,
        });
      } catch (e) {
        console.error(`Bugが出ました。id: ${id} , message: ${e}`);
        bugScriptListIds.current.push(id);
        return;
      }
    } else {
      console.error("Worker is not initialized yet.");
    }
  };

  /**
   * WebWorkerメッセージを処理する
   */
  const handleWorkerMessage = async (e: MessageEvent) => {
    if (!worker.current) return;
    // console.log("Worker received message: ", e.data);
    const { type, data, messageId, log } = e.data;
    if (log) {
      console.log(log);
    }
    if (type === SD.getOMByName) {
      // 特定の名前のOMを取得する
      const { name } = data as { name: string };
      const om = engine.getOMByName(name);
      if (om) {
        worker.current.postMessage({
          type: "response",
          data: OMArgs2Obj({...om}),
          messageId: messageId,
        });
      } else {
        // console.error(`Name: ${name}, OM not found.`);
        worker.current.postMessage({
          type: "response",
          data: null,
          messageId: messageId,
        });
      }
    } else if (type == SD.setPosition) {
      // 特定のOMの位置を設定する
      const { id, position } = data as {
        id: string;
        position:
          | { x: number; y: number; z: number }
          | [number, number, number];
      };
      const om = engine.getOMById(id);
      if (om) {
        engine.setArg(id, "position", ConvPos(position));
        worker.current.postMessage({
          type: "response",
          data: null,
          messageId: messageId,
        });
      } else {
        console.error(`od: ${id}, OM not found.`);
        worker.current.postMessage({
          type: "response",
          data: null,
          messageId: messageId,
        });
      }
    } else if (type == SD.setRotation) {
      // 特定のOMの回転を設定する
      const { id, rotation } = data as {
        id: string;
        rotation:
          | { x: number; y: number; z: number }
          | [number, number, number];
      };
      const om = engine.getOMById(id);
      if (om) {
        engine.setArg(id, "rotation", ConvRot(rotation));
        worker.current.postMessage({
          type: "response",
          data: null,
          messageId: messageId,
        });
      } else {
        console.error(`Name: ${name}, OM not found.`);
        worker.current.postMessage({
          type: "response",
          data: null,
          messageId: messageId,
        });
      }
    } else if (type == SD.setScale) {
      // 特定のOMのスケールを設定する
      const { id, scale } = data as {
        id: string;
        scale: { x: number; y: number; z: number } | [number, number, number];
      };
      const om = engine.getOMById(id);
      if (om) {
        engine.setArg(id, "scale", ConvScale(scale));
        worker.current.postMessage({
          type: "response",
          data: null,
          messageId: messageId,
        });
      } else {
        console.error(`Id: ${id}, OM not found.`);
        worker.current.postMessage({
          type: "response",
          data: null,
          messageId: messageId,
        });
      }
    } else if (type == SD.setArg) {
      // 特定のOMの属性を変更する
      const { id, key, value } = data as {
        id: string;
        key: string;
        value: any;
      };
      const om = engine.getOMById(id);
      if (om) {
        engine.setArg(id, key, value);
        worker.current.postMessage({
          type: "response",
          data: null,
          messageId: messageId,
        });
      } else {
        console.error(`Name: ${name}, OM not found.`);
        worker.current.postMessage({
          type: "response",
          data: null,
          messageId: messageId,
        });
      }
    } else if (type == SD.addOM) {
      // OMを追加する
      const { om } = data as {
        om: any;
      };
      const init = InitOM();
      // initをベースとしてomをマージする
      const _om = { ...init, ...om } as IObjectManagement;
      engine.addOM(_om);
    } else if (type == SD.getKVS) {
      // KVSを取得する
      const { key } = data as { key: string };
      const value = getKVS(key);
      worker.current.postMessage({
        type: "response",
        data: value,
        messageId: messageId,
      });
    } else if (type == SD.createKVS) {
      // KVSを作成する
      const { key, value } = data as { key: string; value: any };
      createKVS(key, value);
      worker.current.postMessage({
        type: "response",
        data: null,
        messageId: messageId,
      });
    } else if (type == SD.updateKVS) {
      // KVSを更新する
      const { key, value } = data as { key: string; value: any };
      updateKVS(key, value);
      worker.current.postMessage({
        type: "response",
        data: null,
        messageId: messageId,
      });
    } else if (type == SD.removeKVS) {
      // KVSを削除する
      const { key } = data as { key: string };
      removeKVS(key);
      worker.current.postMessage({
        type: "response",
        data: null,
        messageId: messageId,
      });
    }
  };

  return (
    <NinjaWorkerContext.Provider
      value={{
        worker,
        loadUserScript,
        runInitialize,
        runFrameLoop,
      }}
    >
      {children}
    </NinjaWorkerContext.Provider>
  );
};

import { SkinnedMesh } from "three";
import { NinjaEngine } from "./NinjaEngineManager";
import { IScriptManagement } from "./utils/NinjaProps";

declare var self: any;

/**
 * NinjaEngineから呼び出されるWorker
 */
export class NinjaEngineWorker {
  engine: NinjaEngine;
  worker: Worker;
  constructor(engine: NinjaEngine) {
    this.engine = engine;
    // 追加
    this.handleWorkerMessage = this.handleWorkerMessage.bind(this);
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
      ${importScriptsCode}
      \n
      self.addEventListener("message", (event) => {
        const { type, id, state, delta } = event.data;
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
      });
    `;
  
    const userScriptBlob = new Blob([`${workerScript}`], {
      type: "application/javascript",
    });
  
    const userScriptURL = URL.createObjectURL(userScriptBlob);
    this.worker = new Worker(userScriptURL);
    // initializeとframeLoopを実行できるようにする
    this.worker.addEventListener("message", this.handleWorkerMessage);
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
   */
  handleWorkerMessage = (e: MessageEvent) => {
    const { type, data } = e.data;
    console.log("check handleWorkerMessage");
    if (type == "getOM") {
      // OMを取得する
      const { id } = data;
      this.worker.postMessage({ type: "getOM", data: this.engine.getOMById(id) })
    }
    else if (type == "setPosition"){
      // 特定のIDのOMの位置を変更する
      const { id, position } = data;
      const om = this.engine.getOMById(id);
      if (om) {
        om.object.position.set(position.x, position.y, position.z);
      }
    }
    else if (type == "getPosition") {
      // 特定のIDのOMの位置を取得する
      const { id } = data;
      const om = this.engine.getOMById(id);
      if (om) {
        this.worker.postMessage({ type: "getPosition", data: om.object.position })
      }
    }
    else if (type == "setRotation"){
      // 特定のIDのOMの回転を変更する
      const { id, rotation } = data;
      const om = this.engine.getOMById(id);
      if (om) {
        om.object.rotation.set(rotation.x, rotation.y, rotation.z);
      }
    }
    else if (type == "getRotation") {
      // 特定のIDのOMの回転を取得する
      const { id } = data;
      const om = this.engine.getOMById(id);
      if (om) {
        this.worker.postMessage({ type: "getRotation", data: om.object.rotation })
      }
    }
    else if (type == "setScale"){
      // 特定のIDのOMのスケールを変更する
      const { id, scale } = data;
      const om = this.engine.getOMById(id);
      if (om) {
        om.object.scale.set(scale.x, scale.y, scale.z);
      }
    }
    else if (type == "getScale") {
      // 特定のIDのOMのスケールを取得する
      const { id } = data;
      const om = this.engine.getOMById(id);
      if (om) {
        this.worker.postMessage({ type: "getScale", data: om.object.scale })
      }
    }
    else if (type == "setQuaternion"){
      // 特定のIDのOMの回転を変更する
      const { id, quaternion } = data;
      const om = this.engine.getOMById(id);
      if (om) {
        om.object.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
      }
    }
    else if (type == "changeAvatarOffset"){
      // アバターのカメラオフセットを変更する
      const { offset } = data;
      this.engine.avatar.cameraOffset = offset.clone();
    }
    else if (type == "changeUniforms"){
      // 特定のIDのOMのuniformsを変更する
      const { id, uniforms } = data;
      const om = this.engine.getOMById(id);
      if (om) {
        // uniformsの値を変更する
      }
    }
    else if (type == "changeVisible"){
      // 特定のIDのOMのvisibleを変更する
      const { id, visible } = data;
      const om = this.engine.getOMById(id);
      if (om) {
        om.object.visible = visible;
      }
    }
    else if (type == "changeVisibleType"){
      // 特定のIDのOMのvisibleTypeを変更する
      const { id, visibleType } = data;
      const om = this.engine.getOMById(id);
      if (om) {
        om.visibleType = visibleType;
      }
    }
    else if (type == "changeAnimation"){
      // 特定のIDのOMのanimationを変更する
      const { id, animation } = data;
      const om = this.engine.getOMById(id);
      if (om) {
        if (om.object instanceof SkinnedMesh) {
          om.mixer.stopAllAction();
          om.mixer.clipAction(animation).play();
        }
      }
    }
    else if (type == "startAnimationByName"){
      // 特定のIDのOMのanimationを開始する
      const { id, animationName } = data;
      const om = this.engine.getOMById(id);
      if (om) {
        if (om.object instanceof SkinnedMesh) {
          const animation = om.animations.find(animation => animation.name == animationName);
          if (animation) {
            om.mixer.stopAllAction();
            om.mixer.clipAction(animation).play();
          }
        }
      }
    }
    else if (type == "stopAnimationByName"){
      // 特定のIDのOMのanimationを停止する
      const { id, animationName } = data;
      const om = this.engine.getOMById(id);
      if (om) {
        if (om.object instanceof SkinnedMesh) {
          const animation = om.animations.find(animation => animation.name == animationName);
          if (animation) {
            om.mixer.stopAllAction();
          }
        }
      }
    }
    else if (type == "startSound"){
      // 特定のIDのサウンドを開始する
      const { id } = data;
      const sound = this.engine.getSoundById(id);
      if (sound) {
        sound.sound.play();
      }
    }
    else if (type == "loopSound"){
      // 特定のIDのサウンドをループする
      const { id } = data;
      const sound = this.engine.getSoundById(id);
      if (sound) {
        sound.sound.setLoop(true);
        sound.sound.play();
      }
    }
    else if (type == "stopSound"){
      // 特定のIDのサウンドを停止する
      const { id } = data;
      const sound = this.engine.getSoundById(id);
      if (sound) {
        sound.sound.stop();
      }
    }
    else if (type == "setSoundVolume"){
      // 特定のIDのサウンドの音量を変更する
      const { id, volume } = data;
      const sound = this.engine.getSoundById(id);
      if (sound) {
        sound.sound.setVolume(volume);
      }
    }
  }

}
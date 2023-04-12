import { SkinnedMesh } from "three";
import { NinjaEngine } from "./NinjaEngineManager";

interface IWorkerMessage {
  type: "WEB3_CALL" | "ENGINE_CALL" | "AXIOS_CALL";
}


export class NinjaEngineWorker {
  engine: NinjaEngine;
  worker: Worker;
  constructor(engine: NinjaEngine) {
    this.engine = engine;
    this.worker = new Worker("../NinjaWorkerApi.js");
    this.worker.onmessage = (e: MessageEvent) => {
      this.handleWorkerMessage(e);
    }
  }

  /**
   * WebWorkerのメッセージを処理する
   */
  handleWorkerMessage = (e: MessageEvent) => {
    const { type, data } = e.data;
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
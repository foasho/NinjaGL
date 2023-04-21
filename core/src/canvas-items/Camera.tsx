import React, { useContext, useEffect, useRef, useState } from "react";
import { NinjaEngineContext } from "../utils/NinjaEngineManager";
import { OrbitControls } from "@react-three/drei";
import { IObjectManagement } from "../utils/NinjaProps";
import { MoveableCamera } from "./MoveableCamera";
import { useThree } from "@react-three/fiber";
import { Vector3 } from "three";


const CameraComponent = (om: IObjectManagement) => {
  let _camera;
  const { camera } = useThree();
  if (om.args.type == "orbit"){
    _camera = (<OrbitControls/>);
  }
  else if (om.args.type == "moveable"){
    _camera = (<MoveableCamera/>);
  }
  useEffect(() => {
    if (om.args.type == "fixed" && om.args.default == true) {
      if (om.args.position) {
        camera.position.copy(om.args.position);
      }
      if (om.args.rotation) {
        camera.rotation.copy(om.args.rotation);
      }
      if (om.args.scale) {
        camera.scale.copy(om.args.scale);
      }
      if (om.args.fov) {
        // camera.fov = om.args.fov;
      }
      if (om.args.near) {
        camera.near = om.args.near;
      }
      if (om.args.far) {
        camera.far = om.args.far;
      }
      if (om.args.aspect) {
        // camera.aspect = om.args.aspect;
      }
      if (om.args.cameraDirection) {// CameraDirectionがあれば、そちらを向く
        const vec3 = new Vector3().copy(om.args.cameraDirection);
        camera.lookAt(vec3);
      }
    }
  }, []);
  return (
    <>
      {_camera}
    </>
  )
}

export const Cameras = () => {
  const engine = useContext(NinjaEngineContext);
  const cameras = engine ? engine.getCameras() : [];
  const [nonCamera, setNonCamera] = useState(false);
  if (cameras.length == 0){
    console.info("No camera found. Add a Default Moveble Camera.");
  }
  useEffect(() => {
    const cameras = engine.getCameras();
    if (cameras.length == 0 && !engine.getAvatar()){
      setNonCamera(true);
    }
    else {
      setNonCamera(false);
    }
  }, [engine]);

  return (
    <>
      {cameras.length > 0 &&
        <>
          {cameras.map((om, index) => {
            return (
              <CameraComponent key={index} {...om} />
            )
          })}
        </>
      }
      {/* カメラもアバターもなければ、デフォルトのカメラを追加する */}
      {nonCamera &&
        <>
          <MoveableCamera/>
        </>
      }
    </>
  )
}
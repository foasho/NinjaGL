import React, { useContext, useEffect, useRef } from "react";
import { NinjaEngineContext } from "../utils/NinjaEngineManager";
import { OrbitControls } from "@react-three/drei";
import { IObjectManagement } from "../utils/NinjaProps";
import { MoveableCamera } from "./MoveableCamera";


const CameraComponent = (om: IObjectManagement) => {
  let _camera;
  if (om.args.type == "fixed"){
    _camera = (<perspectiveCamera/>);
  }
  else if (om.args.type == "orbit"){
    _camera = (<OrbitControls/>);
  }
  else if (om.args.type == "moveable"){
    _camera = (<MoveableCamera/>);
  }
  const ref = useRef<any>();
  useEffect(() => {
    if (ref.current) {
      ref.current.layers.set(om.layerNum);
      if (om.args.position) {
        ref.current.position.copy(om.args.position);
      }
      if (om.args.rotation) {
        ref.current.rotation.copy(om.args.rotation);
      }
      if (om.args.scale) {
        ref.current.scale.copy(om.args.scale);
      }
      if (om.args.fov) {
        ref.current.fov = om.args.fov;
      }
      if (om.args.near) {
        ref.current.near = om.args.near;
      }
      if (om.args.far) {
        ref.current.far = om.args.far;
      }
      if (om.args.aspect) {
        ref.current.aspect = om.args.aspect;
      }
      if (om.args.lookAt) {
        ref.current.lookAt(om.args.lookAt);
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
  if (cameras.length == 0){
    console.info("No camera found. Add a Default Moveble Camera.");
  }

  return (
    <>
      {cameras.length > 0 ?
        <>
          {cameras.map((om, index) => {
            return (
              <CameraComponent key={index} {...om} />
            )
          })}
        </>
        :
        <>
          <MoveableCamera/>
          {/* <OrbitControls/> */}
        </>
      }
    </>
  )
}
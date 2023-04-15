import { useContext } from "react";
import { NinjaEngineContext } from "../NinjaEngineManager";
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
  return (
    <>
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
        <MoveableCamera/>
      }
    </>
  )
}
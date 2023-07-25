import * as React from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { IObjectManagement } from "../utils/NinjaProps";
import { MoveableCamera } from "./MoveableCamera";
import { Vector3 } from "three";
import { useNinjaEngine } from "../hooks/useNinjaEngine";

export const Cameras = () => {
  const { oms } = useNinjaEngine();
  const cameras = React.useMemo(() => {
    return oms.filter((om) => om.type === "camera");
  }, [oms]);

  const camera = cameras.length > 0 ? cameras[0] : null;

  return (
    <>
      {camera &&
        <CameraComponent {...camera} />
      }
      {!camera &&
        <OrbitControls />
      }
    </>
  )
}

const CameraComponent = (om: IObjectManagement) => {
  const { setOMObjectById } = useNinjaEngine();
  let _camera: any;
  const { camera } = useThree();
  if (om.args.type == "orbit"){
    _camera = (<OrbitControls/>);
  }
  else if (om.args.type == "moveable"){
    _camera = (<MoveableCamera/>);
  }
  React.useEffect(() => {
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

  React.useEffect(() => {
    if (om.args.type == "fixed" && om.args.default == true) {
      setOMObjectById(om.id, camera);
    }
  }, []);

  return (
    <>
      {_camera}
    </>
  )
}
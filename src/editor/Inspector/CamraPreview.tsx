import styles from "@/App.module.scss";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useSnapshot } from "valtio";
import { globalStore } from "../Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";
import { MyLights } from "../ViewPort/MainViewItems/Lights";
import { StaticObjects } from "../ViewPort/MainViewItems/Objects";
import { Terrain } from "../ViewPort/MainViewItems/Terrain";
import { Avatar } from "../ViewPort/MainViewItems/Player";
import { MySky } from "../ViewPort/MainViewItems/Sky";
import { ThreeObjects } from "../ViewPort/MainViewItems/Three";
import { MyEnviroment } from "../ViewPort/MainViewItems/MyEnvironment";
import { MyTexts } from "../ViewPort/MainViewItems/MyTexts";
import { Euler, Vector3 } from "three";

/**
 * カメラプレビュー画面
 */
export const CameraPreview = () => {
  const { getOMById } = useNinjaEditor();
  const state = useSnapshot(globalStore);
  const om = state.currentId? getOMById(state.currentId) : null;

  return (
    <>
      {om && om.type == "camera" && 
        <div className={styles.cameraPreview}>
          <Canvas className={styles.ncanvas}>
            <MyLights/>
            <StaticObjects/>
            <Terrain/>
            <Avatar/>
            <MySky/>
            <ThreeObjects/>
            <MyEnviroment/>
            <MyTexts/>
            <CameraPreviewFrame/>
          </Canvas>
        </div>
      }
    </>
  )
}

const CameraPreviewFrame = () => {
  const { getOMById } = useNinjaEditor();
  const state = useSnapshot(globalStore);
  const om = state.currentId? getOMById(state.currentId) : null;
  const { camera } = useThree();

  useFrame((_, delta) => {
    if (om){
      const cpos: Vector3 = (om && om.args.position)? om.args.position : new Vector3(0, 0, 5);
      const crot: Euler = (om && om.args.rotation)? om.args.rotation : new Euler(0, 0, 0);
      camera.position.copy(cpos.clone());
      camera.rotation.copy(crot.clone());
    }
  });

  return (
    <>
    </>
  )
}
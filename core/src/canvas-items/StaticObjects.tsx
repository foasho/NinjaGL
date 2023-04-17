import { useContext } from "react";
import { Euler, Vector3 } from "three";
import { NinjaEngineContext } from "../utils/NinjaEngineManager";
import { IObjectManagement } from "../utils/NinjaProps";

export interface IStaticObjectsProps { }

export const StaticObjects = () => {
  const engine = useContext(NinjaEngineContext);
  const staticObjects = engine ? engine.getStaticObjects() : [];

  return (
    <>
      {staticObjects.map((om, index) => {
        return <StaticObject om={om} key={index} />
      })}
    </>
  )
}

interface IStaticObject {
  om: IObjectManagement;
}
const StaticObject = (props: IStaticObject) => {
  let position = new Vector3(0, 0, 0);
  let rotation = new Euler(0, 0, 0);
  if (props.om.args.position){
    position.copy(props.om.args.position as Vector3);
  }
  if (props.om.args.rotation){
    rotation.copy(props.om.args.rotation as Euler);
  }
  
  return (
    <mesh position={position} rotation={rotation} layers={props.om.layerNum}>
      {props.om.object && <primitive object={props.om.object} />}
    </mesh>
  )
}
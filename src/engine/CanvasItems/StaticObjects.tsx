import { useContext } from "react";
import { Euler, Vector3 } from "three";
import { NaniwaEngineContext } from "../Core/NaniwaEngineManager";
import { IObjectManagement } from "../Core/NaniwaProps";

export interface IStaticObjectsProps { }

export const StaticObjects = () => {
  const engine = useContext(NaniwaEngineContext);
  const staticObjects = engine ? engine.getStaticObjects() : null;

  return (
    <>
    {staticObjects.map(om => {
      return <StaticObject om={om} />
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
    position.copy(props.om.args.position);
  }
  if (props.om.args.rotation){
    position.copy(props.om.args.rotation);
  }
  return (
    <mesh position={position} rotation={rotation}>
      {props.om.object && <primitive object={props.om.object} />}
    </mesh>
  )
}
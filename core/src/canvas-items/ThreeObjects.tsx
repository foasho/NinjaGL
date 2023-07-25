import { MeshReflectorMaterial } from "@react-three/drei";
import { NinjaEngineContext } from "../utils/NinjaEngineManager";
import { IObjectManagement } from "../utils/NinjaProps";
import * as React from "react"
import { Color, MathUtils, Object3D } from "three";
import { ShaderMaterial } from "three";

const ThreeObject = (om: IObjectManagement) => {
  const ref = React.useRef<any>();
  const engine = React.useContext(NinjaEngineContext);
  // const matRef = useRef<any>();
  let geometry: any;
  let material: any;
  if (om.args.type == "plane") {
    // @ts-ignore
    geometry = (<planeGeometry />);
  }
  else if (om.args.type == "sphere") {
    // @ts-ignore
    geometry = (<sphereGeometry />);
  }
  else if (om.args.type == "box") {
    // @ts-ignore
    geometry = (<boxGeometry />);
  }
  else if (om.args.type == "cylinder") {
    // @ts-ignore
    geometry = (<cylinderGeometry />);
  }
  else if (om.args.type == "capsule") {
    // @ts-ignore
    geometry = (<capsuleGeometry />);
  }

  if (om.args.materialData) {
    const color = om.args.materialData.type != "shader" ? new Color(om.args.materialData.value): new Color(0xffffff);
    if (om.args.materialData.type == "standard") {
      // @ts-ignore
      material = (<meshStandardMaterial color={color} />);
    }
    else if (om.args.materialData.type == "phong") {
      // @ts-ignore
      material = (<meshPhongMaterial color={color} />);
    }
    else if (om.args.materialData.type == "toon") {
      // @ts-ignore
      material = (<meshToonMaterial color={color} />);
    }
    else if (om.args.materialData.type == "shader") {
      // @ts-ignore
      material = (<shaderMaterial />);
    }
    else if (om.args.materialData.type == "reflection") {
      // @ts-ignore
      material = (<MeshReflectorMaterial mirror={0} color={color}/>);
    }
  }
  let castShadow = true;
  if (om.args.castShadow != undefined) {
    castShadow = om.args.castShadow;
  }
  let receiveShadow = true;
  if (om.args.receiveShadow != undefined) {
    receiveShadow = om.args.receiveShadow;
  }
  
  React.useEffect(() => {
    if (ref.current && engine) {
      engine.setOMObjectById(om.id, ref.current as Object3D);
      if (ref.current) {
        if (om.args.position) {
          ref.current.position.copy(om.args.position);
        }
        if (om.args.rotation) {
          ref.current.rotation.copy(om.args.rotation);
        }
        if (om.args.scale) {
          ref.current.scale.copy(om.args.scale);
        }
        if (om.args.materialData){
          if (om.args.materialData.type !== "shader"){
            // @ts-ignore
          }
        }
      }
    }
  }, []);

  return (
    <>
      {geometry &&
        // @ts-ignore
        <mesh 
          ref={ref}
          castShadow={castShadow}
          receiveShadow={receiveShadow}
        >
          {geometry}
          {material}
        {/** @ts-ignore */}
        </mesh>
      }
    </>
  )
}

export const ThreeObjects = () => {
  const engine = React.useContext(NinjaEngineContext);
  const threes = engine ? engine.getThreeObjects() : [];
  return (
    <>
      {threes.map((om, index) => {
        return <ThreeObject {...om} key={index} />
      })}
    </>
  )
}
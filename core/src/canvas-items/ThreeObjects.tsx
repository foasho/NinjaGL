import { MeshReflectorMaterial } from "@react-three/drei";
import { NinjaEngineContext } from "../utils/NinjaEngineManager";
import { IObjectManagement } from "../utils/NinjaProps";
import React, { useContext, useEffect, useRef } from "react"
import { Color, MathUtils, Object3D } from "three";
import { ShaderMaterial } from "three";

const ThreeObject = (om: IObjectManagement) => {
  const ref = useRef<any>();
  const engine = useContext(NinjaEngineContext);
  // const matRef = useRef<any>();
  let geometry;
  let material;
  if (om.args.type == "plane") {
    geometry = (<planeGeometry />);
  }
  else if (om.args.type == "sphere") {
    geometry = (<sphereGeometry />);
  }
  else if (om.args.type == "box") {
    geometry = (<boxGeometry />);
  }
  else if (om.args.type == "cylinder") {
    geometry = (<cylinderGeometry />);
  }
  else if (om.args.type == "capsule") {
    geometry = (<capsuleGeometry />);
  }

  if (om.args.materialData) {
    const color = om.args.materialData.type != "shader" ? new Color(om.args.materialData.value): new Color(0xffffff);
    if (om.args.materialData.type == "standard") {
      material = (<meshStandardMaterial color={color} />);
    }
    else if (om.args.materialData.type == "phong") {
      material = (<meshPhongMaterial color={color} />);
    }
    else if (om.args.materialData.type == "toon") {
      material = (<meshToonMaterial color={color} />);
    }
    else if (om.args.materialData.type == "shader") {
      material = (<shaderMaterial />);
    }
    else if (om.args.materialData.type == "reflection") {
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
  
  useEffect(() => {
    if (ref.current) {
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
      <mesh 
        ref={ref}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      >
        {geometry}
        {material}
      </mesh>
      }
    </>
  )
}

export const ThreeObjects = () => {
  const engine = useContext(NinjaEngineContext);
  const threes = engine ? engine.getThreeObjects() : [];
  return (
    <>
      {threes.map((om, index) => {
        return <ThreeObject {...om} key={index} />
      })}
    </>
  )
}
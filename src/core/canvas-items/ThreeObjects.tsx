import { NinjaEngineContext } from "../NinjaEngineManager";
import { IObjectManagement } from "../utils/NinjaProps";
import { useContext, useEffect, useRef } from "react"
import { Color, MathUtils, Object3D } from "three";
import { ShaderMaterial } from "three";

const ThreeObject = (om: IObjectManagement) => {
  const engine = useContext(NinjaEngineContext);
  let geometry;
  let material;
  if (om.args.type == "plane") {
    geometry = (<planeBufferGeometry />);
  }
  else if (om.args.type == "sphere") {
    geometry = (<sphereBufferGeometry />);
  }
  else if (om.args.type == "box") {
    geometry = (<boxBufferGeometry />);
  }
  else if (om.args.type == "cylinder") {
    geometry = (<cylinderBufferGeometry />);
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
  }
  let castShadow = true;
  if (om.args.castShadow != undefined) {
    castShadow = om.args.castShadow;
  }
  const ref = useRef();
  useEffect(() => {
    if (ref.current) {
      engine.setOMObjectById(om.id, ref.current as Object3D);
    }
  }, [ref.current]);

  return (
    <>
      {geometry &&
      <mesh 
        ref={ref}
        castShadow={castShadow}
        position={om.args.position ? om.args.position : [0, 0, 0]}
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
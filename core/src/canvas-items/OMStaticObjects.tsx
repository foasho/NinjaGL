import * as React from "react";
import { Euler, Vector3 } from "three";
import { IObjectManagement } from "../utils/NinjaProps";
import { useNinjaEngine } from "../hooks/useNinjaEngine";

export interface IStaticObjectsProps { }

export const StaticObjects = () => {
  const engine = useNinjaEngine();
  const staticObjects = React.useMemo(() => {
    if (!engine) return [];
    const staticObjects = engine.oms.filter((o: IObjectManagement) => o.type === "object");
    return staticObjects? staticObjects : [];
  }, [engine]);
  return (
    <>
      {staticObjects.map((om, index) => {
        return <StaticObject om={om} key={index} />
      })}
    </>
  )
}

const StaticObject = ({ om }) => {
  // const ref = React.useRef();
  React.useEffect(() => {
    // Animationがあればmiserにセット
    if (om.args.defaultAnimation){
      const animation = om.animations.find((anim) => anim.name == om.args.defaultAnimation);
      if (animation && om.mixer){
        om.mixer.clipAction(animation).play();
      }
    }
  }, [om]);

  return (
    <>
      {om.object &&
        <group
          position={om.args.position ? om.args.position : new Vector3()}
          rotation={om.args.rotation ? om.args.rotation : new Euler()}
          scale={om.args.scale ? om.args.scale : new Vector3(1, 1, 1)}
          layers={om.layerNum ? om.layerNum : 0}
        >
          <primitive 
            object={om.object}
          />
        </group>
      }
    </>
  )
}
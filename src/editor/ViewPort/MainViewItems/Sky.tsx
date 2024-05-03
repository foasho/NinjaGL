import { useEffect, useState } from "react";
import { IObjectManagement } from "@ninjagl/core";
import { Sky } from "@react-three/drei";
import { useSnapshot } from "valtio";

import { editorStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

import { PivotControls } from "./PivoitControl";

export const MySky = () => {
  const { currentId } = useSnapshot(editorStore);
  const { oms, onOMsChanged, offOMsChanged } = useNinjaEditor();
  const [sky, setSky] = useState<IObjectManagement | null>(null);
  useEffect(() => {
    const update = () => {
      const _sky = oms.current.find((om) => om.type == "sky");
      setSky(_sky ? _sky : null);
    };
    update();
    onOMsChanged(update);
    return () => {
      offOMsChanged(update);
    };
  }, [offOMsChanged, oms, onOMsChanged]);
  return (
    <>
      {sky && (
        <>
          <PivotControls
            visible={currentId == sky.id}
            depthTest={false}
            lineWidth={2}
            anchor={[0, 0, 0]}
            // onDrag={(e) => onDrag(e)}
            // onDragStart={onDragStart}
            // onDragEnd={() => onDragEnd()}
            disableAxes
            disableSliders
          >
            <mesh visible={currentId == sky.id}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color={0xff0000} wireframe />
            </mesh>
          </PivotControls>
          <Sky
          // distance={1000} // Camera distance (default=450000)
          // sunPosition={[0, 1, 0]}
          // inclination={0}
          // azimuth={0}
          // turbidity={10}
          // turbidity={number('Turbidity', 8, { range: true, max: 10, step: 0.1 })}
          // rayleigh={number('Rayleigh', 6, { range: true, max: 10, step: 0.1 })}
          // mieCoefficient={number('mieCoefficient', 0.005, { range: true, max: 0.1, step: 0.001 })}
          // mieDirectionalG={number('mieDirectionalG', 0.8, { range: true, max: 1, step: 0.01 })}
          // sunPosition={[number('Pos X', 0), number('Pos Y', 0), number('Pos Z', 0)]}
          />
        </>
      )}
    </>
  );
};

import { memo, useState } from "react";

import { GizmoHelper, GizmoViewport, Text } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { Color, Vector3 } from "three";
import { useSnapshot } from "valtio";

import { MoveableCameraControl } from "@/editor/Common/MoveableCamera";
import { globalEditorStore } from "@/editor/Store/editor";

/**
 * 補助機能
 */
const _ViewHelper = () => {
  const { isGrid, isGizmo, isWorldHelper, cameraSpeed, cameraFar, worldGridSize, worldSize } =
    useSnapshot(globalEditorStore);
  const [minimal, setMinimal] = useState(true);
  const gridHelperSize = 4096;
  const divisions = worldGridSize;
  const cellSize = worldSize / divisions;
  const numberElements: any[] = [];
  const numberPlanes: any[] = [];

  const getCenterPosFromLayer = (layer: number, yPos: number, worldSize: number, layerGrid: number): Vector3 => {
    const layerXLen = worldSize / layerGrid;
    const layerZLen = worldSize / layerGrid;
    const cx = worldSize / 2;
    const cz = worldSize / 2;
    const c = Math.ceil(layer / layerGrid);
    let r = layer % layerGrid;
    if (r === 0) r = layerGrid;
    const absPosX = (layerGrid - r) * layerXLen;
    const absPosZ = (c - 1) * layerZLen;
    const worldXZ = [absPosX - cx + layerXLen / 2, -absPosZ + cz - layerZLen / 2];
    return new Vector3(worldXZ[0], yPos, worldXZ[1]);
  };

  if (isWorldHelper) {
    for (let i = 0; i < divisions; i++) {
      for (let j = 0; j < divisions; j++) {
        const number = i * divisions + j + 1;
        const textPosition = getCenterPosFromLayer(number, -0.01, worldSize, divisions);
        const planePosition = new Vector3().addVectors(textPosition, new Vector3(0, -0.01, 0));
        const isEven = (i + j) % 2 === 0;
        const color1 = isEven ? new Color(0x808080) : new Color(0xd3d3d3);
        const color2 = isEven ? new Color(0xd3d3d3) : new Color(0x808080);
        numberElements.push(
          <Text
            key={number}
            fontSize={cellSize * 0.25}
            position={textPosition}
            rotation={[Math.PI / 2, Math.PI, 0]}
            color={color1}
          >
            {number}
          </Text>,
        );
        numberPlanes.push(
          <mesh key={number} position={planePosition} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[cellSize, cellSize]} />
            <meshBasicMaterial color={color2} transparent={true} opacity={0.3} />
          </mesh>,
        );
      }
    }
  }

  return (
    <>
      <MoveableCameraControl cameraSpeed={cameraSpeed} cameraFar={cameraFar} />
      {isGrid && <gridHelper args={[gridHelperSize, gridHelperSize]} />}
      {isGizmo && (
        <GizmoHelper alignment='top-right' margin={[75, 75]}>
          <group scale={0.75}>
            <GizmoViewport labelColor='white' axisHeadScale={1} />
          </group>
        </GizmoHelper>
      )}
      <Perf
        position={"bottom-right"}
        style={{ position: "absolute" }}
        minimal={minimal}
        onClick={() => setMinimal(!minimal)}
      />
      <>
        {numberElements}
        {numberPlanes}
      </>
    </>
  );
};

export const ViewHelper = memo(_ViewHelper);

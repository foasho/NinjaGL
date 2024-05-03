import React, { memo, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { GiFlatPlatform, GiMountaintop, GiPaintBrush } from "react-icons/gi";
import { Button } from "@nextui-org/react";
import { IObjectManagement } from "@ninjagl/core";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { type Mesh, PerspectiveCamera, PointLight, Raycaster } from "three";
import { useSnapshot } from "valtio";

import { landScapeStore } from "@/editor/Store/landscape";
import { editorStore } from "@/editor/Store/Store";
import { EDeviceType, useInputControl } from "@/hooks/useInputControl";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";
import { InspectorDom } from "@/utils/landscape";

import { onMouseMove } from "./LandScape/Utils";

const _LandScape = () => {
  const { oms, onOMsChanged, offOMsChanged } = useNinjaEditor();
  const [landScape, setLandScape] = useState<IObjectManagement | null>(null);

  useEffect(() => {
    const update = () => {
      const _landScape = oms.current.find((om) => om.type == "landscape");
      if (_landScape && _landScape !== landScape) setLandScape(_landScape);
    };
    update();
    onOMsChanged(update);
    return () => {
      offOMsChanged(update);
    };
  }, [landScape, offOMsChanged, oms, onOMsChanged]);

  return <>{landScape && <MyLandScape {...landScape} />}</>;
};

const MyLandScape = ({ ...om }: IObjectManagement) => {
  const { t } = useTranslation();
  const { cameraStop } = useNinjaEditor();
  const { radius, brush, color, power, colorBlend } = useSnapshot(landScapeStore);
  const meshRef = useRef<Mesh>(null!);
  const mouseCircleRef = useRef<Mesh>(null!);
  const { mode } = useSnapshot(editorStore);
  const [url, setUrl] = useState<string>(om.args.url!);
  const { nodes } = useGLTF(url) as any;
  // Inspector Params
  const raycaster = new Raycaster();
  const { input } = useInputControl({ device: EDeviceType.Desktop });
  const isMouseDown = useRef(false);
  const isReverse = useRef(false);
  const pointerLight = useRef<PointLight>(null!);

  useFrame(({ camera, pointer }) => {
    isMouseDown.current = input.mouseButtons.includes(0);
    isReverse.current = input.dash;
    if (mode !== "all" && mode.has("landscape")) {
      onMouseMove({
        pointLightRef: pointerLight,
        meshRef,
        camera: camera as PerspectiveCamera,
        raycaster,
        pointer,
        brush,
        isMouseDown,
        radius,
        power,
        isReverse,
        colorStr: color,
        mouseCircleRef,
        colorBlend,
      });
    }
  });

  return (
    <>
      <mesh
        ref={meshRef}
        geometry={nodes.Plane.geometry}
        material={nodes.Plane.material}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          // Landscapeモードの時のみ選択できる
          if (mode !== "all" && mode.has("landscape")) {
            editorStore.currentId = om.id;
          }
        }}
      >
        {/** ベースマテリアル */}
        {/** Blendingマテリアル */}
      </mesh>
      {mode !== "all" && mode.has("landscape") && (
        <mesh ref={mouseCircleRef} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[radius]} />
          <meshBasicMaterial transparent={true} opacity={0.3} color={0x000000} />
        </mesh>
      )}
      <InspectorDom.In>
        {mode !== "all" && mode.has("landscape") && (
          <div className='p-3'>
            <div>
              <div className='mb-2 font-bold'>{t("brushType")}</div>
              <div className='mb-3 grid grid-cols-3 gap-2'>
                <Button
                  size='sm'
                  className={brush == "normal" ? "bg-cyber" : ""}
                  onClick={() => (landScapeStore.brush = "normal")}
                  startContent={<GiMountaintop />}
                >
                  {t("brushNormal")}
                </Button>
                <Button
                  size='sm'
                  className={brush == "flat" ? "bg-cyber" : ""}
                  onClick={() => (landScapeStore.brush = "flat")}
                  startContent={<GiFlatPlatform />}
                >
                  {t("brushFlat")}
                </Button>
                <Button
                  size='sm'
                  className={brush == "paint" ? "bg-cyber" : ""}
                  onClick={() => (landScapeStore.brush = "paint")}
                  startContent={<GiPaintBrush />}
                >
                  {t("brushPaint")}
                </Button>
              </div>
            </div>
            <div>
              <div className='mb-2 font-bold'>{t("brushStrength")}</div>
              <div>
                <input
                  aria-label='power'
                  type={"range"}
                  value={power}
                  onInput={(e) => (landScapeStore.power = e.currentTarget.valueAsNumber)}
                  min={0.01}
                  max={0.29}
                  step={0.01}
                />
              </div>
            </div>
            <div>
              <div className='mb-2 font-bold'>{t("brushRange")}</div>
              <div>
                <input
                  aria-label='radius'
                  type={"range"}
                  value={radius}
                  onInput={(e) => (landScapeStore.radius = e.currentTarget.valueAsNumber)}
                  min={0.1}
                  max={16}
                  step={0.1}
                />
              </div>
            </div>
            {/** Color */}
            {brush == "paint" && (
              <div className='mt-3'>
                <div className='text-sm font-bold'>{t("color")}</div>
                <div className='flex items-center pt-0.5 leading-[30px]'>
                  <input
                    aria-label='color'
                    type={"color"}
                    value={color}
                    onChange={(e) => (landScapeStore.color = e.target.value)}
                    onFocus={() => (editorStore.editorFocus = true)}
                    onBlur={() => (editorStore.editorFocus = false)}
                    className='h-7 w-7 cursor-pointer rounded-full border-none bg-transparent p-0 shadow-lg outline-none'
                  />
                  <input
                    aria-label='textColor'
                    type={"text"}
                    value={color}
                    onChange={(e) => {
                      // HEXのみを許可
                      if (e.target.value.match(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/)) {
                        landScapeStore.color = e.target.value;
                      }
                    }}
                    className='mx-auto w-3/4 rounded-md border-none bg-[#3a3939] px-2.5 py-1.5 text-right text-sm text-[#f2f2f2] shadow-lg outline-none'
                  />
                </div>
              </div>
            )}
            <div>{/* <a onClick={() => onSave()}>{t("saveTerrain")}</a> */}</div>
          </div>
        )}
      </InspectorDom.In>
    </>
  );
};

export const LandScape = memo(_LandScape);

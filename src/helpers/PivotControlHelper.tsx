import { useMemo, useRef } from "react";
import { Euler, Matrix4, Vector3 } from "three";
import { useSnapshot } from "valtio";

import { editorStore } from "@/editor/Store/Store";
import {
  DragStartComponentProps,
  OnDragStartProps,
  PivotControls,
} from "@/editor/ViewPort/MainViewItems/PivoitControl";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

const tempMat4 = new Matrix4();

/**
 * 単一のPivotControlで管理するためのヘルパー
 * @returns
 */
export const PivotControlHelper = () => {
  const { oms, pivotRef, setPosition, setRotation, setScale } = useNinjaEditor();
  const { currentId } = useSnapshot(editorStore);
  const grapComponent = useRef<DragStartComponentProps | null>(null);

  const om = useMemo(() => {
    if (currentId === null) {
      return null;
    }
    return oms.current.find((_om) => _om.id === currentId);
  }, [currentId]);

  if (!currentId) {
    pivotRef.current = null;
    return null;
  }

  if (!om || !pivotRef.current) {
    return null;
  }

  const onDragStart = (props: OnDragStartProps) => {
    editorStore.pivotControl = true;
    grapComponent.current = props.component;
  };
  const onDragEnd = () => {
    grapComponent.current = null;
  };

  const onDrag = (e: Matrix4) => {
    // 位置/回転率の確認
    const position = new Vector3().setFromMatrixPosition(e);
    const rotation = new Euler().setFromRotationMatrix(e);
    const scale = new Vector3().setFromMatrixScale(e);
    if (grapComponent.current === "Arrow" || grapComponent.current === "Slider") {
      setPosition(currentId, position);
    } else if (grapComponent.current === "Scale") {
      setScale(currentId, scale);
    } else if (grapComponent.current === "Rotator") {
      setRotation(currentId, rotation);
    }
    tempMat4.copy(e);
  };

  console.log("PivotControlHelper", om.type);

  return (
    <>
      {(om.type === "three" ||
        om.type === "text" ||
        om.type === "text3d" ||
        om.type === "image" ||
        om.type === "object" ||
        om.type === "video" ||
        om.type === "ai-npc" ||
        om.type === "light" ||
        om.type === "audio" ||
        om.type === "lightformer" ||
        om.type === "avatar" ||
        om.type === "water") && (
        <PivotControls
          //@ts-ignore
          object={pivotRef}
          depthTest={false}
          visible={!!currentId}
          lineWidth={2}
          anchor={[0, 0, 0]}
          onDrag={(e) => onDrag(e)}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      )}
    </>
  );
};

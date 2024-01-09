import { memo, useRef, useEffect } from "react";

import { useThree } from "@react-three/fiber";
import { Raycaster, Vector3 } from "three";

import { useNinjaEditor } from "@/hooks/useNinjaEditor";
import { addInitOM } from "@/utils/omControls";

import { showSelectNewObjectDialog } from "../editor/Dialogs/SelectNewObjectDialog";

const ray = new Raycaster();
ray.firstHitOnly = true;
// Memo化
const ContextHelper = () => {
  const { camera, pointer, scene } = useThree();
  const { oms, addOM } = useNinjaEditor();
  const point = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onCreateMenu = async () => {
      // 最初に位置を決定する
      let position: Vector3 | undefined;
      // raycastでx,yの位置からpositionを計算
      ray.setFromCamera(pointer, camera);
      const intersects = ray.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        const pos = intersects[0].point;
        position = new Vector3(pos.x, pos.y, pos.z);
      }
      const data = await showSelectNewObjectDialog({
        x: point.current.x,
        y: point.current.y,
      });
      if (data && data.type) {
        const _om = addInitOM(oms.current, data.type, data.value);
        if (_om) {
          if (position) {
            _om.args.position = position;
          }
          addOM(_om);
        }
      }
    };
    const canvas = document.getElementById("mainviewcanvas");
    const handleKeyDown = (e) => {
      // SHIFT + A
      if (e.shiftKey && e.key === "A") {
        // 押された時のpointerの位置を取得
        // -1 ~ +1の範囲
        onCreateMenu();
      }
    };
    const handleMouseMove = (e) => {
      point.current.x = e.clientX;
      point.current.y = e.clientY;
    };

    const handleTouchMove = (e) => {
      point.current.x = e.touches[0].clientX;
      point.current.y = e.touches[0].clientY;
    };

    if (canvas) {
      document.addEventListener("keydown", handleKeyDown);
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("touchmove", handleTouchMove);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (canvas) {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("touchmove", handleTouchMove);
      }
    };
  }, [oms, pointer, camera, scene.children, addOM]);

  return <></>;
};

// Memo化
export const EditorHelper = memo(ContextHelper);

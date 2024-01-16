import { useFrame } from "@react-three/fiber";
import React from "react";
import { Group } from "three";

type DisntanceVisibleProps = {
  children: React.ReactNode;
  distance?: number;
};
/**
 * 距離による表示切り替え
 * @returns 
 */
export const DisntanceVisible = (
  { distance = 25, children }: DisntanceVisibleProps
): JSX.Element => {
  const ref = React.useRef<Group>(null);
  const [visible, setVisible] = React.useState(false);
  useFrame(({ camera }) => {
    if (!ref.current) return;
    // group内の1つ目のobjectの距離を計算する
    if (ref.current.children.length === 0) return;
    const child = ref.current.children[0];
    const d = child.position.distanceTo(camera.position);
    const _v = d < distance;
    if (_v !== visible) setVisible(_v);
  });
  return (
    <group ref={ref} visible={visible}>
      {children}
    </group>
  )
};
import { useFrame } from "@react-three/fiber";
import { use, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Fog } from "three";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

/**
 * 霧のコンポーネント
 * @returns 
 */
export const FogComponent = () => {
  const ref = useRef<Fog>(null);
  const { oms } = useNinjaEditor();

  const fog = useMemo(() => {
    const _fog = oms.find((om) => {
        return om.type == "fog";
    });
    return _fog;
  }, [oms]);

  return (
    <>
      {fog &&
        <fog ref={ref}/>
      }
    </>
  )
}
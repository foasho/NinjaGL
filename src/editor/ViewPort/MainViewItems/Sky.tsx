import { useNinjaEditor } from "@/hooks/useNinjaEditor";
import { IObjectManagement } from "@ninjagl/core"
import { Sky } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useContext, useEffect, useMemo, useState } from "react"


export const MySky = () => {
  const { oms } = useNinjaEditor();
  const sky = useMemo(() => {
    return oms.find((om) => {
      return om.type == "sky";
    });
  }, [oms]);
  return (<>
    {sky &&
      <Sky
        distance={450000} // Camera distance (default=450000)
        sunPosition={[0, 1, 0]}
        inclination={0}
        azimuth={0}
      />
    }
  </>
  )
}
import { useNinjaEditor } from "@/hooks/useNinjaEditor";
import { IObjectManagement } from "@ninjagl/core"
import { Sky } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useContext, useEffect, useMemo, useState } from "react"


export const MySky = () => {
  const { oms, onOMsChanged, offOMsChanged } = useNinjaEditor();
  const [sky, setSky] = useState<IObjectManagement>(null);
  useEffect(() => {
    const update = () => {
      const _sky = oms.current.find((om) => om.type == 'sky');
      setSky(_sky);
    };
    update();
    onOMsChanged(update);
    return () => {
      offOMsChanged(update);
    };
  }, []);
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
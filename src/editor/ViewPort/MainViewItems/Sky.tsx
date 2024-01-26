import { useEffect, useState } from "react";
import { IObjectManagement } from "@ninjagl/core";
import { Sky } from "@react-three/drei";

import { useNinjaEditor } from "@/hooks/useNinjaEditor";

export const MySky = () => {
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
        <Sky
          distance={450000} // Camera distance (default=450000)
          sunPosition={[0, 1, 0]}
          inclination={0}
          azimuth={0}
        />
      )}
    </>
  );
};

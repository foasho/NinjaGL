import { useEffect, useRef, useState } from 'react';

import { IObjectManagement } from '@ninjagl/core';
import { Fog } from 'three';

import { useNinjaEditor } from '@/hooks/useNinjaEditor';

/**
 * 霧のコンポーネント
 * @returns
 */
export const FogComponent = () => {
  const ref = useRef<Fog>(null);
  const { oms, onOMsChanged, offOMsChanged } = useNinjaEditor();
  const [fog, setFog] = useState<IObjectManagement[]>([]);
  useEffect(() => {
    const update = () => {
      const _fog = oms.current.find((om) => om.type == 'fog');
      if (fog !== _fog) {
        setFog(_fog);
      }
    };
    update();
    onOMsChanged(update);
    return () => {
      offOMsChanged(update);
    };
  }, []);

  return <>{fog && <fog ref={ref} />}</>;
};

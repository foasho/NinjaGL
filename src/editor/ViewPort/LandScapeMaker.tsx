import { memo, createContext, useRef, useState } from 'react';

import { Group } from 'three';

import { LandScapeDomTunnel } from '@/helpers/LandScapeTunnel';

import { SetupCreator } from './LandScapeMakerItems/SetupCreator';

type LandScapeMakerContextType = {};

const LandScapeMakerContext = createContext<LandScapeMakerContextType>({});

export const useLandScapeMaker = () => {
  return LandScapeMakerContext;
};

/**
 * Provider
 */
const LandScapeMaker = () => {
  const active = useRef(false);
  const [setup, setSetup] = useState(false);
  const [isWF, setIsWF] = useState(false);
  const [power, setPower] = useState(0.1);

  return (
    <LandScapeMakerContext.Provider value={{}}>
      <SetupCreator />
      {/* <LandScapeMakerItems /> */}
      <LandScapeDomTunnel.Out />
    </LandScapeMakerContext.Provider>
  );
};

// Memo化
export const MemoLandScapeMaker = memo(LandScapeMaker);
"use client";
import { Suspense, useEffect, useState } from 'react';

import {
  NJCFile,
  IConfigParams,
  IObjectManagement,
  IUIManagement,
  ITextureManagement,
  IScriptManagement,
  NinjaGL,
} from '@ninjagl/core';
import { SkeletonUtils } from 'three-stdlib';
import { useSnapshot } from 'valtio';

import { Loading2D } from '@/commons/Loading2D';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';

import { globalConfigStore } from '../Store/Store';

export const ExportNjcFile = (
  oms: IObjectManagement[],
  ums: IUIManagement[],
  tms: ITextureManagement[],
  sms: IScriptManagement[],
  config: IConfigParams,
): NJCFile => {
  const newConfig = { ...config, dpr: undefined };
  // EditorからOMを取得してJSON化する
  const _oms = [...oms];
  _oms.map((om) => {
    const _om = { ...om };
    if (om.type == 'avatar' && _om.object) {
      const target = SkeletonUtils.clone(_om.object);
      target.animations = om.animations ? om.animations : [];
      _om.object = target;
    } else if (om.type == 'object' || om.type == 'terrain') {
      if (!om.object) return _om;
      // Animationがある場合のみSckeletonUtilsでクローンする
      if (om.animations && om.animations.length > 0 && _om.object) {
        const target = SkeletonUtils.clone(_om.object);
        target.animations = om.animations;
        _om.object = target;
      } else {
        _om.object = om.object.clone();
      }
    }
    return _om;
  });
  // Configパラメータを設定する
  const _config: IConfigParams = {
    ...newConfig,
    isDebug: true,
  };

  const njcFile = new NJCFile();
  njcFile.setConfig(_config);
  njcFile.setOMs(oms);
  njcFile.setUMs(ums);
  njcFile.setTMs(tms);
  njcFile.setSMs(sms);
  return njcFile;
};

/**
 * OMとUIから一時的なJSONデータを生成し、
 * NinjaEngineを実行する
 */
export const DebugPlay = () => {
  const [ready, setReady] = useState(false);
  const configState = useSnapshot(globalConfigStore);
  const editor = useNinjaEditor();
  const [njcFile, setNJCFile] = useState<NJCFile | null>(null);
  useEffect(() => {
    const _njcFile = ExportNjcFile(editor.oms, editor.ums, editor.tms, editor.sms, {
      physics: configState.physics,
      dpr: undefined,
      multi: true,
      isApi: true,
      isDebug: true,
    });
    setNJCFile(_njcFile);
    setTimeout(() => {
      setReady(true);
    }, 1000);
    return () => {
      setReady(false);
    };
  }, []);

  // omsだけ渡してProviderを作成する
  return (
    <Suspense fallback={<Loading2D />}>
      <div id='Ninjaviewer' style={{ height: '100%' }}>
        {ready && njcFile && <NinjaGL njc={njcFile} isSplashScreen={false}></NinjaGL>}
      </div>
    </Suspense>
  );
};

import { useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Euler, MathUtils, Vector3 } from 'three';
import { useSnapshot } from 'valtio';

import { isNumber } from '@/commons/functional';
import { globalStore } from '@/editor/Store/Store';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';

export const Transforms = () => {
  const state = useSnapshot(globalStore);
  const id = state.currentId;
  const editor = useNinjaEditor();
  const { t } = useTranslation();
  const om = editor.getOMById(id);
  // --------------------------------------------------
  // 位置/回転/拡大縮小
  const inputXref = useRef<HTMLInputElement>(null);
  const inputYref = useRef<HTMLInputElement>(null);
  const inputZref = useRef<HTMLInputElement>(null);
  const inputRXref = useRef<HTMLInputElement>(null);
  const inputRYref = useRef<HTMLInputElement>(null);
  const inputRZref = useRef<HTMLInputElement>(null);
  const inputSXref = useRef<HTMLInputElement>(null);
  const inputSYref = useRef<HTMLInputElement>(null);
  const inputSZref = useRef<HTMLInputElement>(null);
  // --------------------------------------------------

  const [position, setPosition] = useState<Vector3>(
    om && om.object ? om.object!.position.clone() : new Vector3(0, 0, 0),
  );
  const [rotation, setRotation] = useState<Euler>(om && om.object ? om?.object!.rotation : new Euler(0, 0, 0));
  const [scale, setScale] = useState<Vector3>(om && om.object ? om?.object!.scale : new Vector3(1, 1, 1));
  const [helper, setHelper] = useState<boolean>(false);

  useEffect(() => {
    if (om) {
      if (om.args.position) setPosition(om.args.position);
      if (om.args.rotation) setRotation(om.args.rotation);
      if (om.args.scale) setScale(om.args.scale);
      if (om.args.helper !== undefined) setHelper(om.args.helper);
    }
  }, [om]);

  useEffect(() => {
    const update = () => {
      if (id) {
        const pos = editor.getPosition(id);
        const rot = editor.getRotation(id);
        const sca = editor.getScale(id);
        // 各InputRefのplaceholderを更新
        if (inputXref.current) inputXref.current.placeholder = pos.x.toFixed(2);
        if (inputYref.current) inputYref.current.placeholder = pos.y.toFixed(2);
        if (inputZref.current) inputZref.current.placeholder = pos.z.toFixed(2);
        if (inputRXref.current) inputRXref.current.placeholder = MathUtils.radToDeg(rot.x).toFixed(1);
        if (inputRYref.current) inputRYref.current.placeholder = MathUtils.radToDeg(rot.y).toFixed(1);
        if (inputRZref.current) inputRZref.current.placeholder = MathUtils.radToDeg(rot.z).toFixed(1);
        if (inputSXref.current) inputSXref.current.placeholder = sca.x.toFixed(1);
        if (inputSYref.current) inputSYref.current.placeholder = sca.y.toFixed(1);
        if (inputSZref.current) inputSZref.current.placeholder = sca.z.toFixed(1);
      }
    };
    update();
    if (id) editor.onOMIdChanged(id, update);
    return () => {
      if (id) editor.offOMIdChanged(id, update);
    };
  }, [id]);

  /**
   * 位置変更 Inspector -> Object
   * @param e
   * @param xyz
   */
  const changePosition = (e, xyz: 'x' | 'y' | 'z') => {
    if (!om) return;
    const targetValue = e.target.value;
    const newPosition: Vector3 = om.args.position ? om.args.position.clone() : new Vector3();
    if (xyz == 'x') {
      if (isNumber(targetValue)) {
        newPosition.setX(Number(targetValue));
      }
    } else if (xyz == 'y') {
      if (isNumber(targetValue)) {
        newPosition.setY(Number(targetValue));
      }
    } else if (xyz == 'z') {
      if (isNumber(targetValue)) {
        newPosition.setZ(Number(targetValue));
      }
    }
    if (id) editor.setPosition(id, newPosition);
  };

  /**
   * 回転変更 Inspector -> Object
   * @param e
   * @param xyz
   */
  const changeRotation = (e, xyz: 'x' | 'y' | 'z') => {
    if (!om) return;
    const targetValue = e.target.value;
    const newRotation: Euler = om.args.rotation ? om.args.rotation.clone() : new Euler();
    if (xyz == 'x') {
      if (isNumber(targetValue)) {
        const targetRad = MathUtils.degToRad(targetValue);
        newRotation.set(Number(targetRad), newRotation.y, newRotation.z);
      }
    } else if (xyz == 'y') {
      if (isNumber(targetValue)) {
        const targetRad = MathUtils.degToRad(targetValue);
        newRotation.set(newRotation.x, Number(targetRad), newRotation.z);
      }
    } else if (xyz == 'z') {
      if (isNumber(targetValue)) {
        const targetRad = MathUtils.degToRad(targetValue);
        newRotation.set(newRotation.x, newRotation.y, Number(targetRad));
      }
    }
    if (id) editor.setRotation(id, newRotation);
  };

  /**
   * 拡大縮小変更 Inspector -> Object
   */
  const changeScale = (e, xyz: 'x' | 'y' | 'z') => {
    if (!om) return;
    const targetValue = e.target.value;
    const newScale: Vector3 = om.args.scale ? om.args.scale.clone() : new Vector3();
    if (xyz == 'x') {
      if (isNumber(targetValue)) {
        newScale.setX(Number(targetValue));
      }
    } else if (xyz == 'y') {
      if (isNumber(targetValue)) {
        newScale.setY(Number(targetValue));
      }
    } else if (xyz == 'z') {
      if (isNumber(targetValue)) {
        newScale.setZ(Number(targetValue));
      }
    }
    if (id) editor.setScale(id, newScale);
  };

  /**
   * Helper表示切り替え
   */
  const onCheckHelper = () => {
    if (id) editor.setArg(id, 'helper', !helper);
    setHelper(!helper);
  };

  return (
    <>
      {/* Position */}
      <div className='w-full pt-4'>
        <div className='text-sm font-bold'>{t('position')}</div>
        <div className='grid grid-cols-3 gap-3 text-center text-xs'>
          <div>X</div>
          <div>Y</div>
          <div>Z</div>
        </div>
        <div className="flex w-full justify-between">
          <input
            type='text'
            ref={inputXref}
            placeholder={position ? position.x.toFixed(2) : '0'}
            onKeyDown={(e: any) => {
              if (e.key === 'Enter') {
                changePosition(e, 'x');
              }
            }}
            onInput={(e: any) => {
              if (isNumber(e.target.value)) {
                const newPosition = position.clone();
                newPosition.setX(Number(e.target.value));
                setPosition(newPosition);
              }
            }}
            onFocus={() => (globalStore.editorFocus = true)}
            onBlur={() => (globalStore.editorFocus = false)}
            className="mr-0.5 w-[calc(33.33%-10px)] rounded-md border-none bg-[#3a3939] px-2.5 py-1.5 text-right text-[#f2f2f2] shadow-lg outline-none"
          />
          <input
            type='text'
            ref={inputYref}
            placeholder={position ? position.y.toFixed(2) : '0'}
            onKeyDown={(e: any) => {
              if (e.key === 'Enter') {
                changePosition(e, 'y');
              }
            }}
            onInput={(e: any) => {
              if (isNumber(e.target.value)) {
                const newPosition = position.clone();
                newPosition.setY(Number(e.target.value));
                setPosition(newPosition);
              }
            }}
            onFocus={() => (globalStore.editorFocus = true)}
            onBlur={() => (globalStore.editorFocus = false)}
            className="mr-0.5 w-[calc(33.33%-10px)] rounded-md border-none bg-[#3a3939] px-2.5 py-1.5 text-right text-[#f2f2f2] shadow-lg outline-none"
          />
          <input
            type='text'
            ref={inputZref}
            placeholder={position ? position.y.toFixed(2) : '0'}
            onKeyDown={(e: any) => {
              if (e.key === 'Enter') {
                changePosition(e, 'z');
              }
            }}
            onInput={(e: any) => {
              if (isNumber(e.target.value)) {
                const newPosition = position.clone();
                newPosition.setZ(Number(e.target.value));
                setPosition(newPosition);
              }
            }}
            onFocus={() => (globalStore.editorFocus = true)}
            onBlur={() => (globalStore.editorFocus = false)}
            className="mr-0.5 w-[calc(33.33%-10px)] rounded-md border-none bg-[#3a3939] px-2.5 py-1.5 text-right text-[#f2f2f2] shadow-lg outline-none"
          />
        </div>
      </div>
      {/* Rotation */}
      <div className='w-full pt-4'>
        <div className='text-sm font-bold'>{t('rotation')}</div>
        <div className='grid grid-cols-3 gap-3 text-center text-xs'>
          <div>X</div>
          <div>Y</div>
          <div>Z</div>
        </div>
        <div className="flex w-full justify-between">
          <input
            type='text'
            ref={inputRXref}
            placeholder={rotation ? MathUtils.radToDeg(rotation.x).toFixed(1) : '0'}
            onKeyDown={(e: any) => {
              if (e.key === 'Enter') {
                changeRotation(e, 'x');
              }
            }}
            onInput={(e: any) => {
              if (isNumber(e.target.value)) {
                const newRotation = rotation ? rotation.clone() : new Euler(0, 0, 0);
                newRotation.set(e.target.value, newRotation.y, newRotation.z);
                setRotation(newRotation);
              }
            }}
            onFocus={() => (globalStore.editorFocus = true)}
            onBlur={() => (globalStore.editorFocus = false)}
            className="mr-0.5 w-[calc(33.33%-10px)] rounded-md border-none bg-[#3a3939] px-2.5 py-1.5 text-right text-[#f2f2f2] shadow-lg outline-none"
          />
          <input
            // value={rotation? MathUtils.radToDeg(rotation.y).toFixed(1): ""}
            type='text'
            ref={inputRYref}
            placeholder={rotation ? MathUtils.radToDeg(rotation.y).toFixed(1) : '0'}
            onKeyDown={(e: any) => {
              if (e.key === 'Enter') {
                changeRotation(e, 'y');
              }
            }}
            onInput={(e: any) => {
              if (isNumber(e.target.value)) {
                const newRotation = rotation ? rotation.clone() : new Euler(0, 0, 0);
                newRotation.set(newRotation.x, e.target.value, newRotation.z);
                setRotation(newRotation);
              }
            }}
            onFocus={() => (globalStore.editorFocus = true)}
            onBlur={() => (globalStore.editorFocus = false)}
            className="mr-0.5 w-[calc(33.33%-10px)] rounded-md border-none bg-[#3a3939] px-2.5 py-1.5 text-right text-[#f2f2f2] shadow-lg outline-none"
          />
          <input
            // value={rotation?MathUtils.radToDeg(rotation.z).toFixed(1): ""}
            type='text'
            ref={inputRZref}
            placeholder={rotation ? MathUtils.radToDeg(rotation.z).toFixed(1) : '0'}
            onKeyDown={(e: any) => {
              if (e.key === 'Enter') {
                changeRotation(e, 'z');
              }
            }}
            onInput={(e: any) => {
              if (isNumber(e.target.value)) {
                const newRotation = rotation ? rotation.clone() : new Euler(0, 0, 0);
                newRotation.set(newRotation.x, rotation.y, e.target.value);
                setRotation(newRotation);
              }
            }}
            onFocus={() => (globalStore.editorFocus = true)}
            onBlur={() => (globalStore.editorFocus = false)}
            className="mr-0.5 w-[calc(33.33%-10px)] rounded-md border-none bg-[#3a3939] px-2.5 py-1.5 text-right text-[#f2f2f2] shadow-lg outline-none"
          />
        </div>
      </div>
      {/* Scale */}
      <div className='w-full pt-4'>
        <div className='text-sm font-bold'>{t('scale')}</div>
        <div className='grid grid-cols-3 gap-3 text-center text-xs'>
          <div>X</div>
          <div>Y</div>
          <div>Z</div>
        </div>
        <div className="flex w-full justify-between">
          <input
            // value={scale?(scale.x).toFixed(1): ""}
            ref={inputSXref}
            type='text'
            placeholder={scale ? scale.x.toString() : '0'}
            onKeyDown={(e: any) => {
              if (e.key === 'Enter') {
                changeScale(e, 'x');
              }
            }}
            onInput={(e: any) => {
              if (isNumber(e.target.value)) {
                const newScale = scale ? scale.clone() : new Vector3(1, 1, 1);
                newScale.set(e.target.value, newScale.y, newScale.z);
                setScale(newScale);
              }
            }}
            onFocus={() => (globalStore.editorFocus = true)}
            onBlur={() => (globalStore.editorFocus = false)}
            className="mr-0.5 w-[calc(33.33%-10px)] rounded-md border-none bg-[#3a3939] px-2.5 py-1.5 text-right text-[#f2f2f2] shadow-lg outline-none"
          />
          <input
            // value={scale?(scale.y).toFixed(1): ""}
            type='text'
            ref={inputSYref}
            placeholder={scale ? scale.y.toString() : '0'}
            onKeyDown={(e: any) => {
              if (e.key === 'Enter') {
                changeScale(e, 'y');
              }
            }}
            onInput={(e: any) => {
              if (isNumber(e.target.value)) {
                const newScale = scale ? scale.clone() : new Vector3(1, 1, 1);
                newScale.set(newScale.x, e.target.value, newScale.z);
                setScale(newScale);
              }
            }}
            onFocus={() => (globalStore.editorFocus = true)}
            onBlur={() => (globalStore.editorFocus = false)}
            className="mr-0.5 w-[calc(33.33%-10px)] rounded-md border-none bg-[#3a3939] px-2.5 py-1.5 text-right text-[#f2f2f2] shadow-lg outline-none"
          />
          <input
            // value={scale?(scale.z).toFixed(1): ""}
            type='text'
            ref={inputSZref}
            placeholder={scale ? scale.z.toString() : '0'}
            onKeyDown={(e: any) => {
              if (e.key === 'Enter') {
                changeScale(e, 'z');
              }
            }}
            onInput={(e: any) => {
              if (isNumber(e.target.value)) {
                const newScale = scale ? scale.clone() : new Vector3(1, 1, 1);
                newScale.set(newScale.x, newScale.y, e.target.value);
                setScale(newScale);
              }
            }}
            onFocus={() => (globalStore.editorFocus = true)}
            onBlur={() => (globalStore.editorFocus = false)}
            className="mr-0.5 w-[calc(33.33%-10px)] rounded-md border-none bg-[#3a3939] px-2.5 py-1.5 text-right text-[#f2f2f2] shadow-lg outline-none"
          />
        </div>
      </div>
      <div>
        <div className="inline-block px-0.5 pt-2 text-lg font-bold">{t('helper')}</div>
        <div className="inline-block pl-3">
          <input type='checkbox' className="scale-125 cursor-pointer align-middle accent-[#43D9D9]" checked={helper} onInput={() => onCheckHelper()} />
        </div>
      </div>
    </>
  );
};

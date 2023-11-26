import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Euler, MathUtils, Vector3 } from 'three';
import { useSnapshot } from 'valtio';

import styles from '@/App.module.scss';
import { isNumber } from '@/commons/functional';
import { globalStore } from '@/editor/Store/Store';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';

export const Transforms = () => {
  const state = useSnapshot(globalStore);
  const id = state.currentId;
  const editor = useNinjaEditor();
  const { t } = useTranslation();
  const om = editor.getOMById(id);

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
      <div className={styles.position}>
        <div className={styles.title}>{t('position')}</div>
        <div className={styles.name}>
          <div>X</div>
          <div>Y</div>
          <div>Z</div>
        </div>
        <div className={styles.inputContainer}>
          <input
            type='text'
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
          />
          <input
            type='text'
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
          />
          <input
            type='text'
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
          />
        </div>
      </div>
      <div className={styles.rotation}>
        <div className={styles.title}>{t('rotation')}</div>
        <div className={styles.name}>
          <div>X</div>
          <div>Y</div>
          <div>Z</div>
        </div>
        <div className={styles.inputContainer}>
          <input
            type='text'
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
          />
          <input
            // value={rotation? MathUtils.radToDeg(rotation.y).toFixed(1): ""}
            type='text'
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
          />
          <input
            // value={rotation?MathUtils.radToDeg(rotation.z).toFixed(1): ""}
            type='text'
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
          />
        </div>
      </div>
      <div className={styles.scale}>
        <div className={styles.title}>{t('scale')}</div>
        <div className={styles.name}>
          <div>X</div>
          <div>Y</div>
          <div>Z</div>
        </div>
        <div className={styles.inputContainer}>
          <input
            // value={scale?(scale.x).toFixed(1): ""}
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
          />
          <input
            // value={scale?(scale.y).toFixed(1): ""}
            type='text'
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
          />
          <input
            // value={scale?(scale.z).toFixed(1): ""}
            type='text'
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
          />
        </div>
      </div>
      <div className={styles.helper}>
        <div className={styles.title}>{t('helper')}</div>
        <div className={styles.input}>
          <input type='checkbox' className={styles.checkbox} checked={helper} onInput={() => onCheckHelper()} />
          <span className={styles.customCheckbox}></span>
        </div>
      </div>
    </>
  );
};

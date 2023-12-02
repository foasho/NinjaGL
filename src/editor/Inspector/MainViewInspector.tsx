import { useEffect } from 'react';

import { useSnapshot } from 'valtio';

import { globalStore } from '@/editor/Store/Store';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';

import { Animation } from './InspectorForms/Animation';
import { CameraParams } from './InspectorForms/CameraParams';
import { EnvironmentParam } from './InspectorForms/EnvironmentParam';
import { FormType } from './InspectorForms/FormType';
import { Intensity } from './InspectorForms/Intensity';
import { Physics } from './InspectorForms/Physics';
import { Shadows } from './InspectorForms/Shadows';
import { Transforms } from './InspectorForms/Transforms';
import { Visible } from './InspectorForms/Visible';
import { MySwal } from '@/commons/Swal';

export const MainViewInspector = () => {
  const state = useSnapshot(globalStore);
  const id = state.currentId;
  const editor = useNinjaEditor();

  const selectOM = id ? editor.getOMById(id) : null;
  const otype = selectOM ? selectOM.type : null;

  /**
   * 選択中Objectをdeleteする
   * @param id
   */
  const deleteObject = (id: string) => {
    const did = id;
    globalStore.currentId = null;
    editor.removeOM(did);
  };

  const onKeyDown = (e) => {
    if (e.key == 'Delete' && id) {
      const om = editor.getOMById(id);
      if (om && om.type != "avatar") {
        deleteObject(id);
      }
      else {
        MySwal.fire({
          title: 'Delete',
          text: 'Delete is not allowed object type',
          icon: 'warning',
          confirmButtonText: 'OK',
        })
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  });

  return (
    <>
      {otype && (
        <div className='mb-16'>
          {(otype == 'object' ||
            otype == 'avatar' ||
            otype == 'light' ||
            otype == 'three' ||
            otype == 'terrain' ||
            otype == 'camera' ||
            otype == 'text' ||
            otype == 'text3d' ||
            otype == 'lightformer') && <Transforms />}

          {(otype == 'object' || otype == 'three') && <Physics />}

          {(otype == 'light' || otype == 'three' || otype == 'object' || otype == 'avatar') && (
            <>
              <Shadows />
              <Visible />
            </>
          )}

          {(otype == 'object') && <Animation />}
          {otype == 'environment' && <EnvironmentParam />}
          {otype == 'lightformer' && <FormType />}
          {(otype == 'effect' || otype == 'light') && <Intensity />}
          {otype == 'camera' && <CameraParams />}
        </div>
      )}
    </>
  );
};

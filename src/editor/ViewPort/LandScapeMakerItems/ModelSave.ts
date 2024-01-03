import { MySwal } from '@/commons/Swal';
import { b64EncodeUnicode } from '@/commons/functional';
import { convertObjectToBlob } from "@ninjagl/core";
import { t } from 'i18next';
import { Group, Mesh, Object3D } from 'three';

export const modelSave = async (
  object: Object3D | Group | Mesh,
  saveDir: string,
) => {
  const obj3d = new Object3D();
  obj3d.add(object.clone());
  const blob = await convertObjectToBlob(obj3d);
  MySwal.fire({
    title: t('inputFileName'),
    input: 'text',
    showCancelButton: true,
    confirmButtonText: '実行',
    showLoaderOnConfirm: true,
    preConfirm: async (inputStr: string) => {
      //バリデーションを入れたりしても良い
      if (inputStr.length == 0) {
        return MySwal.showValidationMessage(t('leastInput'));
      }
      const formData = new FormData();
      formData.append('file', blob);
      const keyPath = `${saveDir}/${inputStr}.glb`;
      formData.append('filePath', keyPath);
      try {
        const response = await fetch('/api/storage/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Error uploading file');
        }
        // @ts-ignore
        Swal.fire({
          title: t('completeSave'),
          text: t('saveSuccess') + `\npersonal/LandScape/${inputStr}.glb`,
        });
      } catch (error) {
        console.error('Error:', error.message);
      }
    },
    allowOutsideClick: function () {
      return !MySwal.isLoading();
    },
  });
};

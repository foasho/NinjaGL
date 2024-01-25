import { convertObjectToBlob } from "@ninjagl/core";
import { t } from "i18next";
import { Group, Mesh, Object3D } from "three";

import { MySwal } from "@/commons/Swal";
import { uploadFile } from "@/utils/upload";

export const modelSave = async (object: Object3D | Group | Mesh, saveDir: string) => {
  const obj3d = new Object3D();
  obj3d.add(object.clone());
  const blob = await convertObjectToBlob(obj3d);
  MySwal.fire({
    title: t("inputFileName"),
    input: "text",
    showCancelButton: true,
    confirmButtonText: "実行",
    showLoaderOnConfirm: true,
    preConfirm: async (inputStr: string) => {
      //バリデーションを入れたりしても良い
      if (inputStr.length == 0) {
        return MySwal.showValidationMessage(t("leastInput"));
      }
      const file = new File([blob], `${inputStr}.glb`, { type: "model/gltf-binary" });
      const filePath = `${saveDir}/${inputStr}.glb`;
      try {
        const res = await uploadFile(file, filePath);

        if (!res || !res.url) {
          throw new Error("Error uploading file");
        }
        MySwal.fire({
          title: t("completeSave"),
          text: t("saveSuccess") + `\npersonal/LandScape/${inputStr}.glb`,
        });
      } catch (error) {
        console.error("Error:", error.message);
      }
    },
    allowOutsideClick: function () {
      return !MySwal.isLoading();
    },
  });
};

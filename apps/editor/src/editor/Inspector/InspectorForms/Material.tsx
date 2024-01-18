import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { useSnapshot } from "valtio";

import { editorStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";
import { normalStyles } from "@/utils/styles";

export const MaterialForm = () => {
  const state = useSnapshot(editorStore);
  const editor = useNinjaEditor();
  const { t } = useTranslation();
  const id = state.currentId;
  const om = id? editor.getOMById(id): null;
  const [materialType, setMaterialType] = useState<{
    value: "standard" | "phong" | "toon" | "shader" | "reflection";
    label: string;
  }>();
  const [materialColor, setMaterialColor] = useState<string>();

  useEffect(() => {
    if (om) {
      if (om.args.materialData) {
        setMaterialType(materialOptions.find((option) => option.value == om.args.materialData!.type));
      } else {
        setMaterialType(materialOptions.find((option) => option.value == "standard"));
        setMaterialColor("#ffffff");
      }
      if (om.args.materialData !== undefined && om.args.materialData.value)
        setMaterialColor(om.args.materialData.value);
    }
  }, [om]);

  // マテリアル種別の選択肢
  const materialOptions: { value: "standard" | "phong" | "toon" | "shader" | "reflection"; label: string }[] = [
    { value: "standard", label: t("StandardMaterial") },
    { value: "phong", label: t("PhongMaterial") },
    { value: "toon", label: t("ToonMaterial") },
    // { value: 'shader', label: t('ShaderMaterial') },
    { value: "reflection", label: t("reflection") },
  ];

  /**
   * マテリアル(種別/色)の変更
   */
  const changeMaterial = (type: "shader" | "standard" | "phong" | "toon" | "reflection", value: any) => {
    if (type !== "shader" && value && id) {
      editor.setMaterialData(id, type, value);
      setMaterialColor(value);
      setMaterialType(materialOptions.find((option) => option.value == type));
    }
  };

  return (
    <div className='mx-4'>
      <div className='px-0.5 py-1.5 text-sm font-bold'>{t("materialConfig")}</div>
      <div>
        <div className='px-0.5 py-1.5 text-sm font-bold'>{t("type")}</div>
        <div>
          <Select
            options={materialOptions}
            value={materialType}
            onChange={(select) => select && changeMaterial(select.value, materialColor)}
            styles={normalStyles}
          />
        </div>
      </div>
      {materialType && materialType.value !== "shader" && (
        <div className='mt-3'>
          <div className='text-sm font-bold'>{t("color")}</div>
          <div className='flex items-center pt-0.5 leading-[30px]'>
            <input
              type={"color"}
              value={materialColor}
              onChange={(e) => changeMaterial(materialType.value, e.target.value)}
              onFocus={() => (editorStore.editorFocus = true)}
              onBlur={() => (editorStore.editorFocus = false)}
              className='size-7 cursor-pointer rounded-full border-none bg-transparent p-0 shadow-lg outline-none'
            />
            <input
              type={"text"}
              value={materialColor}
              onChange={(e) => {
                // HEXのみを許可
                if (e.target.value.match(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/)) {
                  changeMaterial(materialType.value, e.target.value);
                }
              }}
              className='mx-auto w-3/4 rounded-md border-none bg-[#3a3939] px-2.5 py-1.5 text-right text-sm text-[#f2f2f2] shadow-lg outline-none'
            />
          </div>
        </div>
      )}
    </div>
  );
};

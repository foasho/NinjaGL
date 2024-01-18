import { useEffect } from "react";
import { useSnapshot } from "valtio";

import { MySwal } from "@/commons/Swal";
import { editorStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

import { Animation } from "./InspectorForms/Animation";
import { CameraParams } from "./InspectorForms/CameraParams";
import { EnvironmentParam } from "./InspectorForms/EnvironmentParam";
import { FormType } from "./InspectorForms/FormType";
import { Intensity } from "./InspectorForms/Intensity";
import { MaterialForm } from "./InspectorForms/Material";
import { Physics } from "./InspectorForms/Physics";
import { Shadows } from "./InspectorForms/Shadows";
import { SystemContent } from "./InspectorForms/SystemContent";
import { TextContent } from "./InspectorForms/TextContent";
import { Transforms } from "./InspectorForms/Transforms";
import { UrlArg } from "./InspectorForms/UrlArg";
import { ViewableDistance } from "./InspectorForms/ViewableDistance";
import { Visible } from "./InspectorForms/Visible";
import { WidthHeight } from "./InspectorForms/WidthHeight";
import { WidthHeightSegments } from "./InspectorForms/WidthHeightSegments";

export const MainViewInspector = () => {
  const state = useSnapshot(editorStore);
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
    editorStore.currentId = null;
    editor.removeOM(did);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key == "Delete" && id) {
      const om = editor.getOMById(id);
      if (om && om.type != "avatar") {
        deleteObject(id);
      } else {
        MySwal.fire({
          title: "Delete",
          text: "Delete is not allowed object type",
          icon: "warning",
          confirmButtonText: "OK",
        });
      }
    }
    // Ctrl + Cでコピー
    if (e.key == "c" && e.ctrlKey && id) {
      const om = editor.getOMById(id);
      if (om) {
        editor.copyOM(om);
      }
    }
    // Ctrl + Vでペースト
    if (e.key == "v" && e.ctrlKey && id) {
      const pasteOM = editor.getCopyOM();
      if (pasteOM) {
        editor.addOM(pasteOM);
        // セレクトする
        setTimeout(() => {
          editor.notifyOMIdChanged(pasteOM.id);
          editorStore.currentId = pasteOM.id;
        }, 100);
      }
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  });

  return (
    <>
      {otype && (
        <div className='mb-16'>
          {(otype == "object" ||
            otype == "ai-npc" ||
            otype == "avatar" ||
            otype == "light" ||
            otype == "three" ||
            otype == "camera" ||
            otype == "text" ||
            otype == "text3d" ||
            otype == "water" ||
            otype == "lightformer") && <Transforms />}

          {otype == "three" && <MaterialForm />}

          {(otype == "object" || otype == "three") && <Physics />}

          {(otype == "light" || otype == "three" || otype == "object" || otype == "avatar") && (
            <>
              <Shadows />
              <Visible />
            </>
          )}

          {(otype == "object" ||
            otype == "ai-npc" ||
            otype == "light" ||
            otype == "three" ||
            otype == "text" ||
            otype == "text3d" ||
            otype == "lightformer") && <ViewableDistance />}

          {otype == "object" && <Animation />}
          {(otype == "ai-npc" ||
            otype == "avatar" ||
            otype == "audio" ||
            otype == "image" ||
            otype == "video" ||
            otype == "object") && <UrlArg />}

          {otype == "water" && <WidthHeight />}
          {otype == "water" && <WidthHeightSegments />}

          {otype == "environment" && <EnvironmentParam />}
          {otype == "lightformer" && <FormType />}
          {(otype == "effect" || otype == "light") && <Intensity />}

          {(otype == "text" || otype == "text3d") && <TextContent />}
          {otype == "ai-npc" && <SystemContent />}
          {otype == "camera" && <CameraParams />}
        </div>
      )}
    </>
  );
};

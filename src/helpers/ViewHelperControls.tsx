import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AiFillCamera, AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { HiOutlineSelector } from "react-icons/hi";
import { ImEarth } from "react-icons/im";
import { MdVideogameAsset, MdVideogameAssetOff } from "react-icons/md";
import { TiSpanner } from "react-icons/ti";
import { Select, SelectItem } from "@nextui-org/react";
import clsx from "clsx";
import { useSnapshot } from "valtio";

import { isNumber } from "@/commons/functional";
import { MySwal } from "@/commons/Swal";
import { showSelectNewObjectDialog } from "@/editor/Dialogs/SelectNewObjectDialog";
import { globalEditorStore } from "@/editor/Store/editor";
import { editorStore, globalConfigStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";
import { sendServerConfig } from "@/utils/dataSync";
import { addInitOM } from "@/utils/omControls";

/**
 * 補助機能
 */
const _ViewHelperControls = () => {
  const { projectId, oms, addOM } = useNinjaEditor();
  const editorState = useSnapshot(editorStore);
  const config = useSnapshot(globalConfigStore);
  const { physics } = config;
  const { isGrid, showCanvas, isWorldHelper, isGizmo, cameraFar, cameraSpeed, uiMode, uiGridNum } =
    useSnapshot(globalEditorStore);
  const [isHovered, setIsHovered] = useState(false);
  const [isConfHovered, setIsConfHovered] = useState(false);

  const { t } = useTranslation();

  return (
    <div className={clsx("absolute left-1/2 top-10 z-50 -translate-x-1/2")}>
      <a
        className='relative mr-1 cursor-pointer rounded-md bg-[#222] px-1.5 py-1 text-white'
        onMouseLeave={() => setIsHovered(false)}
        onMouseOver={() => setIsHovered(true)}
      >
        <ImEarth className='inline' />
        {isHovered && (
          <div className='absolute left-0 top-full z-10 block w-48 rounded-md bg-primary p-3 shadow-md'>
            <div className='mb-3'>
              <label className='block'>
                <input type='checkbox' checked={isGrid} onChange={() => (globalEditorStore.isGrid = !isGrid)} />
                水平グリッド線
              </label>
              <label className='block'>
                <input
                  type='checkbox'
                  checked={isWorldHelper}
                  onChange={() => (globalEditorStore.isWorldHelper = !isWorldHelper)}
                />
                ワールド補助線
              </label>
              <label className='block'>
                <input type='checkbox' checked={isGizmo} onChange={() => (globalEditorStore.isGizmo = !isGizmo)} />
                Gizmo
              </label>
            </div>
            <div className='mb-3 grid grid-cols-2 gap-1'>
              <label>
                視野(far)
                <input
                  type='text'
                  placeholder={cameraFar.toString()}
                  onKeyDown={(e: any) => {
                    if (e.key == "Enter") {
                      if (isNumber(e.target.value)) {
                        const val = Number(e.target.value);
                        if (val <= 4096) {
                          globalEditorStore.cameraFar = val;
                        } else {
                          MySwal.fire({
                            title: "エラー",
                            text: "4096以下の値を入力してください",
                            icon: "error",
                          });
                        }
                      }
                    }
                  }}
                />
              </label>
            </div>
          </div>
        )}
      </a>
      <a
        className='relative mr-1 cursor-pointer rounded-md bg-[#222] px-1.5 py-1 text-white'
        onMouseLeave={() => setIsConfHovered(false)}
        onMouseOver={() => setIsConfHovered(true)}
      >
        <TiSpanner className='inline' />
        {isConfHovered && (
          <div className='absolute left-0 top-full z-10 block min-w-[200px] rounded-md bg-primary p-3 shadow-md'>
            <div>
              <span className='mb-2 mr-3'>{t("physics")}</span>
              <input
                type='checkbox'
                className='inline'
                checked={physics}
                onChange={(e) => {
                  globalConfigStore.physics = e.target.checked;
                  if (projectId) {
                    sendServerConfig(projectId, config);
                  }
                }}
              />
            </div>
          </div>
        )}
      </a>
      <a
        onClick={() => {
          if (cameraSpeed > 7) {
            globalEditorStore.cameraSpeed = 1;
          } else {
            globalEditorStore.cameraSpeed += 1;
          }
        }}
        className='relative mr-1 cursor-pointer select-none rounded-md bg-[#222] px-1.5 py-1 text-white'
      >
        <AiFillCamera className='inline' />
        <span className='align-top text-sm'>{cameraSpeed}</span>
      </a>
      <a
        className='mr-1 cursor-pointer rounded-md bg-[#222] px-1.5 py-1 text-white'
        onClick={() => (globalEditorStore.showCanvas = !showCanvas)}
      >
        {showCanvas ? <AiFillEye className='inline' /> : <AiFillEyeInvisible className='inline' />}
      </a>
      <a
        className='mr-1 cursor-pointer rounded-md bg-[#222] px-1.5 py-1 text-white'
        onClick={() => (globalEditorStore.uiMode = !uiMode)}
      >
        {uiMode ? <MdVideogameAsset className='inline' /> : <MdVideogameAssetOff className='inline' />}
      </a>
      {uiMode && (
        <>
          <a
            onClick={() => {
              if (uiGridNum == 8) {
                globalEditorStore.uiGridNum = 16;
              } else if (uiGridNum == 16) {
                globalEditorStore.uiGridNum = 24;
              } else if (uiGridNum == 24) {
                globalEditorStore.uiGridNum = 32;
              } else if (uiGridNum == 32) {
                globalEditorStore.uiGridNum = 64;
              } else if (uiGridNum == 64) {
                globalEditorStore.uiGridNum = 8;
              }
            }}
            className='ml-0.5 mr-1.5 cursor-pointer rounded-md bg-[#222] px-2.5 py-1 text-lg text-white'
          >
            {uiGridNum}
          </a>
        </>
      )}
      <div className='pt-3'>
        <Select
          label=''
          placeholder='Select an animal'
          labelPlacement='outside'
          className='max-w-xs text-xs'
          selectedKeys={editorState.mode}
          disableSelectorIconRotation
          selectorIcon={<HiOutlineSelector />}
          onSelectionChange={async (selection) => {
            let landscape = oms.current.find((o) => o.type === "landscape");
            if (!landscape) {
              const data = await showSelectNewObjectDialog({ initSelectType: "landscape" });
              if (!data) return;
              if (!data.type || data.type !== "landscape") return;
              const _om = addInitOM(oms.current, data.type!, data.value);
              if (_om) {
                addOM(_om);
                landscape = _om;
              }
            }
            editorState.setMode(selection);
            // 選択中にする
            if (landscape) editorStore.currentId = landscape.id;
          }}
        >
          <SelectItem key='select' value='select' className='text-xs'>
            {t("selectMode")}
          </SelectItem>
          <SelectItem key='landscape' value='landscape' className='text-xs'>
            {t("landscapeMode")}
          </SelectItem>
        </Select>
      </div>
    </div>
  );
};

export const ViewHelperControls = memo(_ViewHelperControls);

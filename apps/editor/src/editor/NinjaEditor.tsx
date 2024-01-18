import { useTranslation } from "react-i18next";
import {
  AiOutlineAppstore,
  AiOutlineCode,
  AiOutlineDown,
  AiOutlineHighlight,
  AiOutlinePicture,
  AiOutlinePlus,
  AiOutlineUp,
} from "react-icons/ai";
import { loadNJCFileFromURL } from "@ninjagl/core";
import clsx from "clsx";
import { useSnapshot } from "valtio";

import { MySwal } from "@/commons/Swal";
import { MainViewer } from "@/editor/ViewPort/MainViewer";
import { PlayerEditor } from "@/editor/ViewPort/PlayerEditor";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";
import { addInitOM } from "@/utils/omControls";

import { AppBar, AppBarHeight } from "./Common/AppBar";
import { WindowdAnalyzer } from "./Common/WindowAnalyzer";
import { showSelectNewObjectDialog } from "./Dialogs/SelectNewObjectDialog";
import { ContentsBrowser } from "./Hierarchy/ContentViewer";
import { HierarchyTree } from "./Hierarchy/HierarchyTree";
import { ScriptNavigation } from "./Hierarchy/ScriptNavigation";
import { ShaderNavigation } from "./Hierarchy/ShaderNavigation";
import { TextureNavigation } from "./Hierarchy/TextureNavigation";
import { UINavigation } from "./Hierarchy/UINavigation";
import { MainViewInspector } from "./Inspector/MainViewInspector";
import { UIInspector } from "./Inspector/UIInstpector";
import { globalEditorStore } from "./Store/editor";
import { editorStore } from "./Store/Store";
import { DebugPlay } from "./ViewPort/DebugPlay";
import { ScriptEditor } from "./ViewPort/ScriptEditor";

import "./Locale";

/**
 * NinjaEngineメインコンポネント
 */
export const NinjaEditor = () => {
  const state = useSnapshot(editorStore);
  const editorState = useSnapshot(globalEditorStore);
  const editor = useNinjaEditor();
  const { viewSelect, selectSubNav, appBar, sideBar } = editorState;
  const { t } = useTranslation();

  /**
   * ビューポートの切り替え
   */
  const changeView = (viewType: "mainview" | "debugplay" | "playereditor" | "scripteditor" | "shadereditor") => {
    if (editorState.viewSelect !== viewType) {
      // editorStore.init();
      globalEditorStore.viewSelect = viewType;
      if (viewType == "scripteditor") {
        globalEditorStore.selectSubNav = "script";
      } else if (viewType == "shadereditor") {
        globalEditorStore.selectSubNav = "shader";
      }
    }
  };

  /**
   * 新しいオブジェクトを追加する
   */
  const onClickNewObject = async () => {
    const data = await showSelectNewObjectDialog({});
    if (data && data.type) {
      const _om = addInitOM(editor.oms.current, data.type, data.value);
      if (_om) editor.addOM(_om);
    }
  };

  /**
   * JSScriptで特定のスクリプトを開く
   */
  const changeScriptEditor = () => {
    globalEditorStore.viewSelect = "scripteditor";
    globalEditorStore.selectSubNav = "script";
  };

  /**
   * プロジェクトの変更
   */
  const changeProject = async (njcUrl: string) => {
    MySwal.fire({
      title: "Change Project?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Yes",
      denyButtonText: `Close`,
    }).then(async (result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        const njcFile = await loadNJCFileFromURL(njcUrl);
        console.info("<< Change: NJCFile >>");
        console.info(njcFile);
        editor.setNJCFile(njcFile);
      }
    });
  };

  return (
    <>
      <div className='w-auto'>
        <AppBar />

        <div
          className={`left-0 m-0`}
          style={{
            height: "100vh",
          }}
        >
          <div className={`relative grid h-[calc(100vh-45px)] w-full grid-cols-6 gap-0`}>
            {/** ヒエラルキービュー */}
            <div
              className={clsx(`absolute left-3 top-[12px] z-30 w-[190px] rounded-lg pt-[2px]`, sideBar && "bg-primary")}
              style={{
                display: viewSelect == "mainview" ? "block" : "none",
              }}
            >
              <div className='relative'>
                <a
                  className={clsx(
                    "absolute top-0 h-6 cursor-pointer rounded-lg bg-primary bg-primary/75 p-0.5 text-white",
                    sideBar ? "right-2" : "left-2",
                  )}
                  onClick={() => (globalEditorStore.sideBar = !sideBar)}
                >
                  {sideBar ? (
                    <AiOutlineDown className='mx-0.5 inline size-4 pb-1' />
                  ) : (
                    <AiOutlineUp className='mx-0.5 inline size-4 pb-1' />
                  )}
                </a>
              </div>
              <div
                className='overflow-y-auto'
                style={{
                  height: `calc(100vh - ${AppBarHeight + 54}px)`,
                  display: sideBar ? "block" : "none",
                }}
              >
                <div className='min-h-[20%] px-[5px] py-[12px]'>
                  <div className='m-0'>
                    <HierarchyTree />
                  </div>
                </div>
                <div className='min-h-[15%] px-[5px] py-[12px]'>
                  <div className='mb-2 h-[20px] select-none p-0 text-center text-white'>
                    <div
                      className={`inline-block text-[#3b3b3b] ${selectSubNav == "ui" && "bg-black"}`}
                      onClick={() => (globalEditorStore.selectSubNav = "ui")}
                    >
                      <span className='cursor-pointer border-r-1 border-white px-1'>
                        <AiOutlineAppstore className='inline pb-1 text-xl font-bold text-white' />
                      </span>
                    </div>
                    <div
                      className={`inline-block text-[#3b3b3b] ${selectSubNav == "script" && "bg-black"}`}
                      onClick={() => (globalEditorStore.selectSubNav = "script")}
                    >
                      <span className='cursor-pointer border-r-1 border-white px-1'>
                        <AiOutlineCode className='inline pb-1 text-xl font-bold text-white' />
                      </span>
                    </div>
                    <div
                      className={`inline-block text-[#3b3b3b] ${selectSubNav == "shader" && "bg-black"}`}
                      onClick={() => (globalEditorStore.selectSubNav = "shader")}
                    >
                      <span className='cursor-pointer border-r-1 border-white px-1'>
                        <AiOutlineHighlight className='inline pb-1 text-xl font-bold text-white' />
                      </span>
                    </div>
                    <div
                      className={`inline-block text-[#3b3b3b] ${selectSubNav == "texture" && "bg-black"}`}
                      onClick={() => (globalEditorStore.selectSubNav = "texture")}
                    >
                      <span className='px-1'>
                        <AiOutlinePicture className='inline pb-1 text-xl font-bold text-white' />
                      </span>
                    </div>
                  </div>
                  <div className='m-0 block px-3 text-white '>
                    {selectSubNav == "ui" && <UINavigation />}
                    {selectSubNav == "script" && <ScriptNavigation />}
                    {selectSubNav == "shader" && <ShaderNavigation />}
                    {selectSubNav == "texture" && <TextureNavigation />}
                  </div>
                </div>
                <div className='bg-primary px-2 pb-12 text-white'>
                  <ContentsBrowser changeScriptEditor={changeScriptEditor} changeProject={changeProject} />
                </div>
                <div
                  className='absolute bottom-0 w-full rounded-md border-t-2 border-black bg-primary'
                  onClick={() => onClickNewObject()}
                >
                  <div className='cursor-pointer select-none rounded-md px-2.5 py-3 text-center text-lg font-bold text-white hover:bg-gray-700'>
                    <span>
                      <AiOutlinePlus className='inline' />
                    </span>
                    <span className='text-sm'>{t("newObject")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/** コンテンツビュー */}
            <div
              className={clsx(`relative w-screen bg-primary`)}
              style={{
                height: appBar ? `calc(100vh - ${AppBarHeight}px)` : "100vh",
              }}
            >
              <div className='absolute left-0 top-0 z-10 m-0 w-full select-none items-center bg-cyber/50 p-0 text-center text-primary'>
                <div className='inline-block'>
                  <a
                    onClick={() => changeView("mainview")}
                    className='cursor-pointer rounded border-r-2 border-black px-2.5 text-xs'
                    style={viewSelect == "mainview" ? { background: "#fff", color: "#838383" } : {}}
                  >
                    {t("mainView")}
                  </a>
                  <a
                    onClick={() => changeView("playereditor")}
                    className='cursor-pointer border-r-2 border-black px-2.5 text-xs'
                    style={viewSelect == "playereditor" ? { background: "#fff", color: "#838383" } : {}}
                  >
                    {t("playerEditor")}
                  </a>
                  <a
                    onClick={() => changeView("scripteditor")}
                    className='cursor-pointer border-r-2 border-black px-2.5 text-xs'
                    style={viewSelect == "scripteditor" ? { background: "#fff", color: "#838383" } : {}}
                  >
                    {t("scriptEditor")}
                  </a>
                  {/** ShaderEditorは非表示にする */}
                  {/* <a
                    onClick={() => changeView('shadereditor')}
                    className='cursor-pointer border-r-2 border-black px-2.5 text-xs'
                    style={viewSelect == 'shadereditor' ? { background: '#fff', color: '#838383' } : {}}
                  >
                    {t('shaderEditor')}
                  </a> */}
                </div>
              </div>
              <div className='m-0 h-full bg-white p-0'>
                {viewSelect == "mainview" && (
                  <>
                    <MainViewer />
                  </>
                )}
                {viewSelect == "debugplay" && (
                  <>
                    <DebugPlay />
                  </>
                )}
                {viewSelect == "playereditor" && (
                  <>
                    <PlayerEditor />
                  </>
                )}
                {viewSelect == "scripteditor" && (
                  <>
                    <ScriptEditor />
                  </>
                )}
              </div>
            </div>
          </div>
          <div
            className='absolute right-[10px] top-[80px] z-30 block text-left text-white'
            style={{
              display: (viewSelect == "mainview" && state.currentId) || viewSelect == "playereditor" ? "block" : "none",
            }}
          >
            {viewSelect == "mainview" && (
              <div
                className='overflow-y-auto rounded-lg bg-secondary/75 px-[10px]'
                style={{
                  width: editorState.uiMode ? "350px" : "230px",
                  height: "calc(100vh - 120px)",
                }}
              >
                {editorState.uiMode ? <UIInspector /> : <MainViewInspector />}
              </div>
            )}
          </div>
        </div>

        <div id='myDialog'></div>
        <WindowdAnalyzer />
      </div>
    </>
  );
};

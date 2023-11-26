import './Locale';
import { loadNJCFileFromURL } from '@ninjagl/core';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import {
  AiOutlineAppstore,
  AiOutlineCode,
  AiOutlineHighlight,
  AiOutlinePicture,
  AiOutlinePlus,
  AiOutlineDown,
  AiOutlineUp,
} from 'react-icons/ai';
import Swal from 'sweetalert2';
import { MathUtils, Vector3 } from 'three';
import { useSnapshot } from 'valtio';

import { MainViewer } from '@/editor/ViewPort/MainViewer';
import { PlayerEditor } from '@/editor/ViewPort/PlayerEditor';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';

import { AppBar, AppBarHeight } from './Common/AppBar';
import { WindowdAnalyzer } from './Common/WindowAnalyzer';
import { showSelectNewObjectDialog } from './Dialogs/SelectNewObjectDialog';
import { ContentsBrowser } from './Hierarchy/ContentViewer';
import { HierarchyTree } from './Hierarchy/HierarchyTree';
import { ScriptNavigation } from './Hierarchy/ScriptNavigation';
import { ShaderNavigation } from './Hierarchy/ShaderNavigation';
import { TextureNavigation } from './Hierarchy/TextureNavigation';
import { UINavigation } from './Hierarchy/UINavigation';
import { MainViewInspector } from './Inspector/MainViewInspector';
import { globalEditorStore } from './Store/editor';
import { globalStore } from './Store/Store';
import { DebugPlay } from './ViewPort/DebugPlay';
import { ScriptEditor } from './ViewPort/ScriptEditor';
import { ShaderEditor } from './ViewPort/ShaderEditor';
import { TerrainMakerCanvas } from './ViewPort/TerrainMaker';

/**
 * NinjaEngineメインコンポネント
 */
export const NinjaEditor = () => {
  const state = useSnapshot(globalStore);
  const editorState = useSnapshot(globalEditorStore);
  const editor = useNinjaEditor();
  const { viewSelect, selectSubNav, appBar, sideBar } = editorState;
  const { t } = useTranslation();

  /**
   * ビューポートの切り替え
   */
  const changeView = (
    viewType: 'mainview' | 'debugplay' | 'terrainmaker' | 'playereditor' | 'scripteditor' | 'shadereditor',
  ) => {
    if (editorState.viewSelect !== viewType) {
      // globalStore.init();
      globalEditorStore.viewSelect = viewType;
      if (viewType == 'scripteditor') {
        globalEditorStore.selectSubNav = 'script';
      } else if (viewType == 'shadereditor') {
        globalEditorStore.selectSubNav = 'shader';
      }
    }
  };

  /**
   * 新しいオブジェクトを追加する
   */
  const onClickNewObject = async () => {
    const data = await showSelectNewObjectDialog();
    if (data.type == 'light') {
      editor.addOM({
        id: MathUtils.generateUUID(),
        name: `*${data.value}`,
        type: 'light',
        args: {
          type: data.value,
          castShadow: true,
          receiveShadow: false,
        },
        physics: false,
        phyType: 'box',
        visibleType: 'auto',
        visible: true,
      });
    } else if (data.type == 'sky') {
      editor.addOM({
        id: MathUtils.generateUUID(),
        name: `*${data.value}`,
        type: 'sky',
        args: {
          type: data.value,
        },
        physics: false,
        phyType: 'box',
        visibleType: 'auto',
        visible: true,
      });
    } else if (data.type == 'three') {
      editor.addOM({
        id: MathUtils.generateUUID(),
        name: `*${data.value}`,
        type: 'three',
        args: {
          type: data.value,
        },
        physics: false,
        phyType: 'box',
        visibleType: 'auto',
        visible: true,
      });
    } else if (data.type == 'fog') {
      editor.addOM({
        id: MathUtils.generateUUID(),
        name: `*${data.value}`,
        type: 'fog',
        args: {
          type: data.value,
        },
        physics: false,
        phyType: 'box',
        visibleType: 'auto',
        visible: true,
      });
    } else if (data.type == 'environment') {
      editor.addOM({
        id: MathUtils.generateUUID(),
        name: `*${data.value}`,
        type: 'environment',
        args: {
          preset: data.value,
        },
        physics: false,
        phyType: 'box',
        visibleType: 'auto',
        visible: true,
      });
    } else if (data.type == 'lightformer') {
      editor.addOM({
        id: MathUtils.generateUUID(),
        name: `*LF-(${data.value})`,
        type: 'lightformer',
        args: {
          form: data.value,
          color: '#ffffff',
          intensity: 1,
          position: new Vector3(0, 1, 0),
        },
        physics: false,
        phyType: 'box',
        visibleType: 'auto',
        visible: true,
      });
    } else if (data.type == 'effect') {
      let _args: any = { type: data.value };
      if (data.value == 'bloom') {
        _args = {
          type: data.value,
          luminanceThreshold: 0.2,
          mipmapBlur: true,
          luminanceSmoothing: 0,
          intensity: 1.25,
        };
      } else if (data.value == 'lut') {
        _args = {
          type: data.value,
          texture: 'std.cube',
        };
      }
      editor.addOM({
        id: MathUtils.generateUUID(),
        name: `*${data.value}`,
        type: 'effect',
        args: _args,
        physics: false,
        phyType: 'box',
        visibleType: 'auto',
        visible: true,
      });
    }
  };

  /**
   * JSScriptで特定のスクリプトを開く
   */
  const changeScriptEditor = () => {
    globalEditorStore.viewSelect = 'scripteditor';
    globalEditorStore.selectSubNav = 'script';
  };

  /**
   * プロジェクトの変更
   */
  const changeProject = async (njcUrl: string) => {
    Swal.fire({
      title: 'Change Project?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      denyButtonText: `Close`,
    }).then(async (result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        const njcFile = await loadNJCFileFromURL(njcUrl);
        console.log('### ロードしたnjcFileを確認 ###');
        console.log(njcFile);
        editor.setNJCFile(njcFile);
        // setProject({...project, name: name});
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
            height: '100vh',
          }}
        >
          <div className={`relative grid h-[calc(100vh-45px)] w-full grid-cols-6 gap-0`}>
            {/** ヒエラルキービュー */}
            <div
              className={clsx(`absolute left-3 top-[12px] z-20 w-[190px] rounded-lg pt-[2px]`, sideBar && 'bg-primary')}
            >
              <div className='relative'>
                <a
                  className={clsx(
                    'absolute top-0 h-6 cursor-pointer rounded-lg bg-primary bg-primary/75 p-0.5 text-white',
                    sideBar ? 'right-2' : 'left-2',
                  )}
                  onClick={() => (globalEditorStore.sideBar = !sideBar)}
                >
                  {sideBar ? (
                    <AiOutlineDown className='mx-0.5 inline h-4 w-4 pb-1' />
                  ) : (
                    <AiOutlineUp className='mx-0.5 inline h-4 w-4 pb-1' />
                  )}
                </a>
              </div>
              <div
                className='overflow-y-auto'
                style={{
                  height: `calc(100vh - ${AppBarHeight + 54}px)`,
                  display: sideBar ? 'block' : 'none',
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
                      className={`inline-block text-[#3b3b3b] ${selectSubNav == 'ui' && 'bg-black'}`}
                      onClick={() => (globalEditorStore.selectSubNav = 'ui')}
                    >
                      <span className='cursor-pointer border-r-1 border-white px-1'>
                        <AiOutlineAppstore className='inline pb-1 text-xl font-bold text-white' />
                      </span>
                    </div>
                    <div
                      className={`inline-block text-[#3b3b3b] ${selectSubNav == 'script' && 'bg-black'}`}
                      onClick={() => (globalEditorStore.selectSubNav = 'script')}
                    >
                      <span className='cursor-pointer border-r-1 border-white px-1'>
                        <AiOutlineCode className='inline pb-1 text-xl font-bold text-white' />
                      </span>
                    </div>
                    <div
                      className={`inline-block text-[#3b3b3b] ${selectSubNav == 'shader' && 'bg-black'}`}
                      onClick={() => (globalEditorStore.selectSubNav = 'shader')}
                    >
                      <span className='cursor-pointer border-r-1 border-white px-1'>
                        <AiOutlineHighlight className='inline pb-1 text-xl font-bold text-white' />
                      </span>
                    </div>
                    <div
                      className={`inline-block text-[#3b3b3b] ${selectSubNav == 'texture' && 'bg-black'}`}
                      onClick={() => (globalEditorStore.selectSubNav = 'texture')}
                    >
                      <span className='px-1'>
                        <AiOutlinePicture className='inline pb-1 text-xl font-bold text-white' />
                      </span>
                    </div>
                  </div>
                  <div className='m-0 block px-3 text-white '>
                    {selectSubNav == 'ui' && <UINavigation />}
                    {selectSubNav == 'script' && <ScriptNavigation />}
                    {selectSubNav == 'shader' && <ShaderNavigation />}
                    {selectSubNav == 'texture' && <TextureNavigation />}
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
                    <span className='text-sm'>{t('newObject')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/** コンテンツビュー */}
            <div
              className={clsx(`relative w-screen bg-primary`)}
              style={{
                height: appBar ? `calc(100vh - ${AppBarHeight}px)` : '100vh',
              }}
            >
              <div className='absolute left-0 top-0 z-10 m-0 w-full select-none items-center bg-cyber/50 p-0 text-center text-primary'>
                <div className='inline-block'>
                  <a
                    onClick={() => changeView('mainview')}
                    className='cursor-pointer rounded border-r-2 border-black px-2.5 text-xs'
                    style={viewSelect == 'mainview' ? { background: '#fff', color: '#838383' } : {}}
                  >
                    {t('mainView')}
                  </a>
                  <a
                    onClick={() => changeView('terrainmaker')}
                    className='cursor-pointer rounded border-r-2 border-black px-2.5 text-xs'
                    style={viewSelect == 'terrainmaker' ? { background: '#fff', color: '#838383' } : {}}
                  >
                    {t('terrainMaker')}
                  </a>
                  <a
                    onClick={() => changeView('playereditor')}
                    className='cursor-pointer border-r-2 border-black px-2.5 text-xs'
                    style={viewSelect == 'playereditor' ? { background: '#fff', color: '#838383' } : {}}
                  >
                    {t('playerEditor')}
                  </a>
                  <a
                    onClick={() => changeView('scripteditor')}
                    className='cursor-pointer border-r-2 border-black px-2.5 text-xs'
                    style={viewSelect == 'scripteditor' ? { background: '#fff', color: '#838383' } : {}}
                  >
                    {t('scriptEditor')}
                  </a>
                  <a
                    onClick={() => changeView('shadereditor')}
                    className='cursor-pointer border-r-2 border-black px-2.5 text-xs'
                    style={viewSelect == 'shadereditor' ? { background: '#fff', color: '#838383' } : {}}
                  >
                    {t('shaderEditor')}
                  </a>
                </div>
              </div>
              <div className='m-0 h-full bg-white p-0'>
                {viewSelect == 'mainview' && (
                  <>
                    <MainViewer />
                  </>
                )}
                {viewSelect == 'debugplay' && (
                  <>
                    <DebugPlay />
                  </>
                )}
                {viewSelect == 'terrainmaker' && <TerrainMakerCanvas />}
                {viewSelect == 'playereditor' && (
                  <>
                    <PlayerEditor />
                  </>
                )}
                {viewSelect == 'scripteditor' && (
                  <>
                    <ScriptEditor />
                  </>
                )}
                {viewSelect == 'shadereditor' && (
                  <>
                    <ShaderEditor />
                  </>
                )}
              </div>
            </div>
          </div>
          <div
            className='fixed right-[10px] top-[80px] block text-left text-white'
            style={{
              display:
                (viewSelect == 'mainview' && state.currentId) ||
                viewSelect == 'terrainmaker' ||
                viewSelect == 'playereditor'
                  ? 'block'
                  : 'none',
            }}
          >
            {viewSelect == 'mainview' && (
              <div
                className='w-[230px] overflow-y-auto rounded-lg bg-secondary/75 px-[10px]'
                style={{
                  height: 'calc(100vh - 120px)',
                }}
              >
                <MainViewInspector />
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

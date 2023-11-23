import './Locale';
import clsx from 'clsx';
import styles from '@/App.module.scss';
import Swal from 'sweetalert2';
import { PlayerEditor } from '@/editor/ViewPort/PlayerEditor';
import { MainViewer } from '@/editor/ViewPort/MainViewer';
import { MathUtils, Vector3 } from 'three';
import { ContentsBrowser } from './Hierarchy/ContentViewer';
import { ScriptEditor } from './ViewPort/ScriptEditor';
import { AiOutlineAppstore, AiOutlineCode, AiOutlineHighlight, AiOutlinePicture, AiOutlinePlus } from 'react-icons/ai';
import { TerrainMakerCanvas } from './ViewPort/TerrainMaker';
import { MainViewInspector } from './Inspector/MainViewInspector';
import { HierarchyTree } from './Hierarchy/HierarchyTree';
import { showSelectNewObjectDialog } from './Dialogs/SelectNewObjectDialog';
import { ShaderEditor } from './ViewPort/ShaderEditor';
import { DebugPlay } from './ViewPort/DebugPlay';
import { UINavigation } from './Hierarchy/UINavigation';
import { useTranslation } from 'react-i18next';
import { loadNJCFileFromURL } from '@ninjagl/core';
import { useSnapshot } from 'valtio';
import { globalStore } from './Store/Store';
import { ScriptNavigation } from './Hierarchy/ScriptNavigation';
import { ShaderNavigation } from './Hierarchy/ShaderNavigation';
import { TextureNavigation } from './Hierarchy/TextureNavigation';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';
import { globalEditorStore } from './Store/editor';
import { AppBar, AppBarHeight } from './Common/AppBar';
import { WindowdAnalyzer } from './Common/WindowAnalyzer';

/**
 * NinjaEngineメインコンポネント
 */
export const NinjaEditor = () => {
  const state = useSnapshot(globalStore);
  const editorState = useSnapshot(globalEditorStore);
  const editor = useNinjaEditor();
  const { viewSelect, selectSubNav, appBar, isMd } = editorState;
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
    } else if (data.type == 'sound') {
      // editor.setObjectManagement(
      //   {
      //     id: generateUUID(),
      //     name: `*${data.value}`,
      //     type: "sound",
      //     args: {
      //       type: data.value
      //     },
      //     physics: "none",
      //     visibleType: "auto",
      //   }
      // )
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
      if (data.value == 'ssr') {
        _args = {
          type: data.value,
          enabled: true,
          temporalResolve: true,
          STRETCH_MISSED_RAYS: true,
          USE_MRT: true,
          USE_NORMALMAP: true,
          USE_ROUGHNESSMAP: true,
          ENABLE_JITTERING: true,
          ENABLE_BLUR: true,
          DITHERING: false,
          temporalResolveMix: { value: 0.9, min: 0, max: 1 },
          temporalResolveCorrectionMix: { value: 0.4, min: 0, max: 1 },
          maxSamples: { value: 0, min: 0, max: 1 },
          resolutionScale: { value: 1, min: 0, max: 1 },
          blurMix: { value: 0.2, min: 0, max: 1 },
          blurKernelSize: { value: 8, min: 0, max: 8 },
          BLUR_EXPONENT: { value: 10, min: 0, max: 20 },
          rayStep: { value: 0.5, min: 0, max: 1 },
          intensity: { value: 2.5, min: 0, max: 5 },
          maxRoughness: { value: 1, min: 0, max: 1 },
          jitter: { value: 0.3, min: 0, max: 5 },
          jitterSpread: { value: 0.25, min: 0, max: 1 },
          jitterRough: { value: 0.1, min: 0, max: 1 },
          roughnessFadeOut: { value: 1, min: 0, max: 1 },
          rayFadeOut: { value: 0, min: 0, max: 1 },
          MAX_STEPS: { value: 20, min: 0, max: 20 },
          NUM_BINARY_SEARCH_STEPS: { value: 6, min: 0, max: 10 },
          maxDepthDifference: { value: 5, min: 0, max: 10 },
          maxDepth: { value: 1, min: 0, max: 1 },
          thickness: { value: 3, min: 0, max: 10 },
          ior: { value: 1.45, min: 0, max: 2 },
        };
      } else if (data.value == 'bloom') {
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
    } else if (data.type == 'xr') {
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
  const changeProject = async (njcUrl: string, name: string) => {
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
          className={`m-0 left-0`}
          style={{
            height: '100vh',
          }}
        >
          <div className={`relative grid grid-cols-6 gap-0 h-[calc(100vh-45px)] w-full`}>
            {/** ヒエラルキービュー */}
            <div
              className={clsx(`pt-[2px] bg-primary`, isMd ? '' : 'absolute z-10')}
              style={{
                height: appBar ? `calc(100vh - ${AppBarHeight}px)` : '100vh',
              }}
            >
              <>
                <div className='px-[5px] py-[12px] min-h-[20%]'>
                  <div className='m-0'>
                    <HierarchyTree />
                  </div>
                </div>
                <div className='px-[5px] py-[12px] min-h-[20%]'>
                  <div className='text-center mb-2 p-0 h-[20px] text-white select-none'>
                    <div
                      className={`inline-block text-[#3b3b3b] ${selectSubNav == 'ui' && 'bg-black'}`}
                      onClick={() => (globalEditorStore.selectSubNav = 'ui')}
                    >
                      <span className='px-1 text-md border-r-1 border-white cursor-pointer'>
                        <AiOutlineAppstore className='inline pb-1 text-xl text-white font-bold' />
                      </span>
                    </div>
                    <div
                      className={`inline-block text-[#3b3b3b] ${selectSubNav == 'script' && 'bg-black'}`}
                      onClick={() => (globalEditorStore.selectSubNav = 'script')}
                    >
                      <span className='px-1 text-md border-r-1 border-white cursor-pointer'>
                        <AiOutlineCode className='inline pb-1 text-xl text-white font-bold' />
                      </span>
                    </div>
                    <div
                      className={`inline-block text-[#3b3b3b] ${selectSubNav == 'shader' && 'bg-black'}`}
                      onClick={() => (globalEditorStore.selectSubNav = 'shader')}
                    >
                      <span className='px-1 text-md border-r-1 border-white cursor-pointer'>
                        <AiOutlineHighlight className='inline pb-1 text-xl text-white font-bold' />
                      </span>
                    </div>
                    <div
                      className={`inline-block text-[#3b3b3b] ${selectSubNav == 'texture' && 'bg-black'}`}
                      onClick={() => (globalEditorStore.selectSubNav = 'texture')}
                    >
                      <span className='px-1 text-md'>
                        <AiOutlinePicture className='inline pb-1 text-xl text-white font-bold' />
                      </span>
                    </div>
                  </div>
                  <div className='block m-0 text-white px-3 '>
                    {selectSubNav == 'ui' && <UINavigation />}
                    {selectSubNav == 'script' && <ScriptNavigation />}
                    {selectSubNav == 'shader' && <ShaderNavigation />}
                    {selectSubNav == 'texture' && <TextureNavigation />}
                  </div>
                </div>
                <div
                  className='text-white bg-primary p-4 max-h-[30vh] overflow-y-auto overflow-x-hidden'
                  style={{ flex: 6 }}
                >
                  <ContentsBrowser changeScriptEditor={changeScriptEditor} changeProject={changeProject} />
                </div>
                <div className={styles.createObj} onClick={() => onClickNewObject()}>
                  <div className={styles.title}>
                    <span className={styles.icon}>
                      <AiOutlinePlus />
                    </span>
                    <span className={styles.name}>{t('newObject')}</span>
                  </div>
                </div>
              </>
            </div>

            {/** コンテンツビュー */}
            <div
              className={clsx(`bg-primary relative`, isMd ? 'col-span-5' : 'w-screen')}
              style={{
                height: appBar ? `calc(100vh - ${AppBarHeight}px)` : '100vh',
              }}
            >
              <div className='absolute top-0 left-0 z-10 m-0 w-full p-0 text-primary bg-cyber/50 select-none'>
                <div className='inline-block'>
                  <a
                    onClick={() => changeView('mainview')}
                    className='px-2.5 text-xs border-r-2 border-black cursor-pointer rounded'
                    style={viewSelect == 'mainview' ? { background: '#fff', color: '#838383' } : {}}
                  >
                    {t('mainView')}
                  </a>
                  <a
                    onClick={() => changeView('terrainmaker')}
                    className='px-2.5 text-xs border-r-2 border-black cursor-pointer rounded'
                    style={viewSelect == 'terrainmaker' ? { background: '#fff', color: '#838383' } : {}}
                  >
                    {t('terrainMaker')}
                  </a>
                  <a
                    onClick={() => changeView('playereditor')}
                    className='px-2.5 text-xs border-r-2 border-black cursor-pointer'
                    style={viewSelect == 'playereditor' ? { background: '#fff', color: '#838383' } : {}}
                  >
                    {t('playerEditor')}
                  </a>
                  <a
                    onClick={() => changeView('scripteditor')}
                    className='px-2.5 text-xs border-r-2 border-black cursor-pointer'
                    style={viewSelect == 'scripteditor' ? { background: '#fff', color: '#838383' } : {}}
                  >
                    {t('scriptEditor')}
                  </a>
                  <a
                    onClick={() => changeView('shadereditor')}
                    className='px-2.5 text-xs border-r-2 border-black cursor-pointer'
                    style={viewSelect == 'shadereditor' ? { background: '#fff', color: '#838383' } : {}}
                  >
                    {t('shaderEditor')}
                  </a>
                </div>
              </div>
              <div className='m-0 p-0 h-full bg-white'>
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
            className='block fixed top-[80px] right-[10px] p-[10px] w-[200px] max-h-[calc(100vh-250px)] rounded-lg bg-secondary/75 text-white text-left overflow-y-auto'
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
              <>
                <MainViewInspector />
              </>
            )}
          </div>
        </div>

        <div id='myDialog'></div>
        <WindowdAnalyzer />
      </div>
    </>
  );
};

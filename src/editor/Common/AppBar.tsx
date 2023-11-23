import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnapshot } from 'valtio';
import { globalEditorStore } from '../Store/editor';
import { MySwal } from '@/commons/Swal';
import { ExportNjcFile } from '../ViewPort/DebugPlay';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';
import { globalConfigStore } from '../Store/Store';
import { loadNJCFile, saveNJCBlob } from '@ninjagl/core';
import { b64EncodeUnicode } from '@/commons/functional';
import { useSession } from 'next-auth/react';
import { BsCheck, BsPlay, BsStop } from 'react-icons/bs';
import { AiFillSave } from 'react-icons/ai';
import { BiEditAlt } from 'react-icons/bi';
import { Button } from '@nextui-org/react';
import { showHelperDialog } from '../Dialogs/HelperDialog';
import { FaAngleDown, FaAngleRight, FaAngleUp } from 'react-icons/fa';

export const AppBarHeight = 45;
export const AppBar = () => {
  const { data: session } = useSession();
  const { t, i18n } = useTranslation();
  const [showFileMenu, setShowFileMenu] = useState<boolean>(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [recentProgects, setRecentProjects] = useState<{ name: string; path: string }[]>([]);
  const configState = useSnapshot(globalConfigStore);
  const editorState = useSnapshot(globalEditorStore);
  const { projectName, autoSave, viewSelect, appBar } = editorState;
  const editor = useNinjaEditor();

  /**
   * プロジェクトが何もないときは、
   * BoxとPlane, DirectionalLight, SpotLightを追加
   * Environment(Sunset)を追加
   */
  useEffect(() => {
    // 最近開いたプロジェクトを取得
    const recentProjects = localStorage.getItem('recentProjects');
    if (recentProjects) {
      setRecentProjects(JSON.parse(recentProjects));
    }
    // AutoSaveが有効かどうかを取得
    const autoSave = localStorage.getItem('autoSave');
    if (autoSave) {
      globalEditorStore.autoSave = true;
    }
  }, []);

  /**
   * 言語選択
   */
  const onClickSelectLang = () => {
    if (i18n.language == 'ja') {
      i18n.changeLanguage('en');
    } else if (i18n.language == 'en') {
      i18n.changeLanguage('ja');
    }
  };

  /**
   * テンプレート選択
   */
  const onClickSelectTemplate = () => {
    MySwal.fire(t('attention').toString(), t('templatePrepare').toString());
  };

  /**
   * デバッグプレイ
   */
  const onPlayStop = () => {
    if (viewSelect == 'debugplay') {
      globalEditorStore.viewSelect = 'mainview';
    } else {
      globalEditorStore.viewSelect = 'debugplay';
    }
  };

  /**
   * プロジェクト名を保存
   */
  const changeProjectName = () => {
    MySwal.fire({
      title: t('changeProjectName').toString(),
      input: 'text',
      showCancelButton: true,
      confirmButtonText: t('change').toString(),
      showLoaderOnConfirm: true,
      preConfirm: async (inputStr) => {
        if (inputStr.length === 0) {
          return MySwal.showValidationMessage(t('leastInput'));
        }
        return inputStr;
      },
      allowOutsideClick: function () {
        return !MySwal.isLoading();
      },
    }).then((result) => {
      if (result.value) {
        globalEditorStore.projectName = result.value;
      }
    });
  };

  /**
   * プロジェクト全体を保存
   * ビルド処理
   */
  const onSave = async (completeAlert: boolean = true) => {
    const njcFile = ExportNjcFile(editor.oms, editor.ums, editor.tms, editor.sms, {
      physics: configState.physics,
      autoScale: configState.autoScale,
      alpha: configState.alpha,
      logarithmicDepthBuffer: configState.logarithmicDepthBuffer,
      antialias: configState.antialias,
      shadowResolution: configState.shadowResolution,
      mapsize: configState.mapsize,
      layerGridNum: configState.layerGridNum,
      lodDistance: configState.lodDistance,
      dpr: configState.dpr as number,
      initCameraPosition: configState.initCameraPosition,
      isDebug: true,
    });
    const blob = await saveNJCBlob(njcFile);
    if (!projectName) {
      MySwal.fire({
        title: t('inputProjectName').toString(),
        input: 'text',
        showCancelButton: true,
        confirmButtonText: t('change').toString(),
        showLoaderOnConfirm: true,
        preConfirm: async (inputStr: string) => {
          //バリデーションを入れたりしても良い
          if (inputStr.length == 0) {
            return MySwal.showValidationMessage(t('leastInput'));
          }
          return inputStr;
        },
        allowOutsideClick: function () {
          return !MySwal.isLoading();
        },
      }).then(async (result) => {
        if (result.value) {
          globalEditorStore.projectName = result.value;
        }
      });
      return;
    }

    if (!session) return;

    // Save to Storage
    const formData = new FormData();
    formData.append('file', blob);
    const uploadPath = `users/${b64EncodeUnicode(session.user!.email as string)}/savedata`;
    const filePath = (uploadPath + `/${projectName}.njc`).replaceAll('//', '/');
    formData.append('filePath', filePath);

    const response = await fetch('/api/storage/upload', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Error uploading file');
    }
    const res = await response.json();
    // 成功したら、ローカルストレージの追加しておく
    localStorage.setItem('recentproject', JSON.stringify({ name: projectName, path: filePath }));
    if (completeAlert) {
      MySwal.fire({
        icon: 'success',
        title: t('success'),
        text: t('saveSuccess') + `savedata/${projectName}.njc`,
      });
    }
  };

  /**
   * ファイルメニューを開く
   */
  const openFileMenu = () => {
    setShowFileMenu(!showFileMenu);
  };
  const handleFileMenuLeave = () => {
    setShowFileMenu(false);
  };
  const handleRecentProjectsHover = () => {
    setShowSubMenu(true);
  };
  const handleSubMenuMouseLeave = () => {
    setShowSubMenu(false);
  };

  /**
   * プロジェクトを開く
   */
  const openProject = async () => {
    const input: HTMLInputElement = document.createElement('input');
    input.type = 'file';
    input.accept = '.njc'; // NJCの拡張子を指定
    input.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const files = target.files;
      if (files && files.length > 0) {
        const file = (target.files as FileList)[0];
        const njcFile = await loadNJCFile(file);
        console.log('### ロードしたnjcFileを確認 ###');
        console.log(njcFile);
        editor.setNJCFile(njcFile);
      }
    };
    input.click();
  };

  useEffect(() => {
    // ※AutoSave調整中
    // AutoSaveが有効なら、AutoSaveを開始
    // let autoSaveInterval;
    // if (autoSave && session){
    //   autoSaveInterval = setInterval(() => {
    //     onSave();
    //   }, 900 * 1000);
    // }
    // return () => {
    //   clearInterval(autoSaveInterval);
    // }
  }, [autoSave]);

  return (
    <>
      {/** アプリNavヘッダー */}
      {appBar && (
        <div className={`w-full h-[${AppBarHeight}px] flex relative bg-primary items-center justify-between text-sm`}>
          <ul className='list-none my-0 mx-auto  py-0 pl-0 pr-12 overflow-hidden text-center w-full h-full relative'>
            <li className='inline-block py-[10px] px-[3px] float-left'>
              <a
                className='select-none px-[10px] py-[5px] rounded-sm text-white hover:text-cyber no-underline h-full'
                onClick={() => openFileMenu()}
              >
                {t('file')}
              </a>
            </li>
            <li className='inline-block py-[10px] px-[3px] float-left'>
              <a
                className='select-none px-[10px] py-[5px] rounded-sm text-white hover:text-cyber no-underline h-full'
                onClick={() => onClickSelectLang()}
              >
                {t('lang')}
              </a>
            </li>
            <li className='md:inline-block py-[10px] px-[3px] float-left hidden'>
              <a
                className='select-none px-[10px] py-[5px] rounded-sm text-white hover:text-cyber no-underline h-full'
                onClick={() => window.open('https://github.com/foasho/NinjaGL', '_blank')}
              >
                Github
              </a>
            </li>
            <li className='inline-block py-[10px] px-[3px] float-left'>
              <a onClick={() => onClickSelectTemplate()}>{t('template')}</a>
            </li>
            <li className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
              <span className='hidden md:inline-block text-md px-[10px] py-[5px] rounded-sm text-white hover:text-cyber no-underline h-full'>
                NinjaGL
              </span>
              <a
                className='inline-block text-white cursor-pointer'
                onClick={() => {
                  changeProjectName();
                }}
              >
                {projectName ? (
                  projectName
                ) : (
                  <>
                    <BiEditAlt className='inline-block' />
                    <span className='text-cyber'>*</span>
                    {t('nontitle')}
                  </>
                )}
              </a>
            </li>
            <li className='inline-block pt-[12px] px-[3px] float-right'>
              <a
                className='p-2 rounded-lg text-primary cursor-pointer bg-cyber hover:bg-secondary hover:text-white'
                onClick={() => onSave()}
              >
                <span className='align-middle'>
                  <AiFillSave className='inline pr-1 h-6 w-6' />
                </span>
                <span className='hidden md:inline'>Save</span>
              </a>
            </li>
            <li className='inline-block py-[12px] px-[3px] float-right'>
              <a
                className='p-2 rounded-lg text-primary cursor-pointer bg-gray-300 hover:bg-gray-500'
                onClick={() => onPlayStop()}
              >
                <span className='align-middle'>
                  {viewSelect == 'debugplay' ? (
                    <>
                      <BsStop className='inline pr-1 h-6 w-6' />
                    </>
                  ) : (
                    <>
                      <BsPlay className='inline pr-1 h-6 w-6' />
                    </>
                  )}
                </span>
                <span className='hidden md:inline'>{viewSelect == 'debugplay' ? <>Stop</> : <>Play</>}</span>
              </a>
            </li>
          </ul>

          {showFileMenu && (
            <div className='absolute top-[45px] left-0 z-20 bg-primary text-white w-[160px] shadow-sm'>
              <ul className='text-xs font-bold list-none m-0 p-0' onMouseLeave={() => handleFileMenuLeave()}>
                {/* <li><a>{t("newProject")}</a></li> ##WEBなので不要?  */}
                <li className='relative'>
                  <a className='block p-2 no-underline rounded-sm cursor-pointer' onClick={() => openProject()}>
                    {t('open')}
                  </a>
                </li>
                <li
                  className='relative'
                  onMouseEnter={() => handleRecentProjectsHover()}
                  onMouseLeave={() => handleSubMenuMouseLeave()}
                >
                  <a className='block p-2 no-underline rounded-sm cursor-pointer'>{t('recentProjects')}</a>
                  {showSubMenu && (
                    <ul
                      className='absolute top-0 left-[160px] min-w-[160px] bg-primary shadow-sm z-10 whitespace-nowrap overflow-hidden'
                      onMouseLeave={() => handleSubMenuMouseLeave()}
                    >
                      {recentProgects.map((pf, idx) => {
                        return (
                          <li key={idx} className='flex'>
                            <a className='p-2 no-underline block cursor-pointer'>{pf.name}</a>
                            <a className='p-2 no-underline block cursor-pointer'>{pf.path}</a>
                          </li>
                        );
                      })}
                      {recentProgects.length == 0 && (
                        <li className='flex'>
                          <a className=' p-2'>{t('noRecentData')}</a>
                        </li>
                      )}
                    </ul>
                  )}
                </li>
                <li className='relative'>
                  <a
                    className='block p-2 no-underline rounded-sm cursor-pointer select-none'
                    onClick={() => (globalEditorStore.autoSave = !autoSave)}
                  >
                    {autoSave ? <BsCheck className='pl-3 inline-block text-white' /> : <> </>}
                    {t('autoSave')}
                  </a>
                </li>
                <li className='relative'>
                  <a className='block p-2 no-underline rounded-sm cursor-pointer' onClick={() => showHelperDialog()}>
                    {t('help')}
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/** AppBarの開閉  */}
      <div className='fixed right-1.5 top-2.5 z-20'>
        <a
          className='p-2 rounded-lg text-primary cursor-pointer bg-transparent hover:bg-cyber/50'
          onClick={() => (globalEditorStore.appBar = !appBar)}
        >
          {appBar ? (
            <FaAngleUp className='inline text-lg text-white pb-1' />
          ) : (
            <FaAngleDown className='inline text-lg text-white pb-1' />
          )}
        </a>
      </div>
    </>
  );
};

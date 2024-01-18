import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AiFillSave } from "react-icons/ai";
import { BiEditAlt } from "react-icons/bi";
import { BsCheck, BsPlay, BsStop } from "react-icons/bs";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import Link from "next/link";
import { Spinner } from "@nextui-org/react";
import { useSession } from "@ninjagl/auth/react";
import { loadNJCFile, saveNJCBlob } from "@ninjagl/core";
import { useSnapshot } from "valtio";

import { b64EncodeUnicode } from "@/commons/functional";
import { MySwal } from "@/commons/Swal";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";
import { uploadFile } from "@/utils/upload";

import { globalEditorStore } from "../Store/editor";
import { globalConfigStore } from "../Store/Store";
import { ExportNjcFile } from "../ViewPort/DebugPlay";

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
  const { oms, ums, tms, sms, setNJCFile } = useNinjaEditor();
  const [loading, setLoading] = useState(false);

  /**
   * プロジェクトが何もないときは、
   * BoxとPlane, DirectionalLight, SpotLightを追加
   * Environment(Sunset)を追加
   */
  useEffect(() => {
    // 最近開いたプロジェクトを取得
    const recentProjects = localStorage.getItem("recentProjects");
    if (recentProjects) {
      setRecentProjects(JSON.parse(recentProjects));
    }
    // AutoSaveが有効かどうかを取得
    const autoSave = localStorage.getItem("autoSave");
    if (autoSave) {
      globalEditorStore.autoSave = true;
    }
  }, []);

  /**
   * 言語選択
   */
  const onClickSelectLang = () => {
    if (i18n.language == "ja") {
      i18n.changeLanguage("en");
    } else if (i18n.language == "en") {
      i18n.changeLanguage("ja");
    }
  };

  /**
   * デバッグプレイ
   */
  const onPlayStop = () => {
    if (viewSelect == "debugplay") {
      globalEditorStore.viewSelect = "mainview";
    } else {
      globalEditorStore.viewSelect = "debugplay";
    }
  };

  /**
   * プロジェクト名を保存
   */
  const changeProjectName = async (): Promise<string | null> => {
    return await MySwal.fire({
      title: t("changeProjectName").toString(),
      input: "text",
      showCancelButton: true,
      confirmButtonText: t("change").toString(),
      showLoaderOnConfirm: true,
      preConfirm: async (inputStr) => {
        if (inputStr.length === 0) {
          return MySwal.showValidationMessage(t("leastInput"));
        }
        return inputStr;
      },
      allowOutsideClick: function () {
        return !MySwal.isLoading();
      },
    }).then((result) => {
      if (result.value) {
        globalEditorStore.projectName = result.value;
        return result.value;
      }
      return null;
    });
  };

  /**
   * プロジェクト全体を保存
   * ビルド処理
   */
  const onSave = async (completeAlert: boolean = true) => {
    // Loadingでblobにまとめる
    if (!session) return;
    setLoading(true);
    let name = projectName;
    if (!name) {
      const _name = await changeProjectName();
      if (!_name) {
        setLoading(false);
        return;
      }
      name = _name;
    }
    const njcFile = ExportNjcFile(oms.current, ums.current, tms.current, sms.current, {
      physics: configState.physics,
      dpr: configState.dpr as number,
      isDebug: true,
      multi: configState.multi,
      isApi: configState.isApi,
      projectName: name,
    });
    const filename = `${name}.njc`;
    const blob = await saveNJCBlob(njcFile);
    const file = new File([blob], filename, { type: "application/octet-stream" });

    // Save to Storage
    const uploadPath = `${b64EncodeUnicode(session.user!.email as string)}/SaveData`;
    const filePath = (uploadPath + `/${name}.njc`).replaceAll("//", "/");

    // サーバーに保存
    const res = await uploadFile(file, filePath);
    if (!res) {
      setLoading(false);
      throw new Error("Error uploading file");
    }
    // 成功したら、ローカルストレージの追加しておく
    localStorage.setItem("recentproject", JSON.stringify({ name: name, path: filePath }));
    if (completeAlert) {
      const download = await MySwal.fire({
        icon: "success",
        title: t("success"),
        text: t("saveSuccess") + `SaveData/${name}.njc`,
        showCancelButton: true,
        confirmButtonText: t("download"),
        cancelButtonText: t("close"),
      }).then((result) => {
        if (result.isConfirmed) {
          return true;
        }
        return false;
      });
      // fileをDownload
      if (download) {
        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        a.download = `${name}.njc`;
        a.click();
        a.remove();
      }
    }
    setLoading(false);
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
    const input: HTMLInputElement = document.createElement("input");
    input.type = "file";
    input.accept = ".njc"; // NJCの拡張子を指定
    input.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const files = target.files;
      if (files && files.length > 0) {
        setLoading(true);
        const file = (target.files as FileList)[0];
        if (!file) return;
        const njcFile = await loadNJCFile(file);
        console.info("### ロードしたnjcFileを確認 ###");
        console.info(njcFile);
        setNJCFile(njcFile);
        setLoading(false);
      }
    };
    input.click();
  };

  useEffect(() => {
    // ※AutoSave調整中
    // AutoSaveが有効なら、AutoSaveを開始
    let autoSaveInterval: NodeJS.Timeout | null = null;
    if (autoSave && session) {
      autoSaveInterval = setInterval(() => {
        onSave(false);
      }, 900 * 1000);
    }
    return () => {
      if (autoSaveInterval) clearInterval(autoSaveInterval);
    };
  }, [autoSave, oms, ums, tms, sms, configState]);

  return (
    <>
      {/** アプリNavヘッダー */}
      {appBar && (
        <div className={`relative flex w-full items-center justify-between bg-primary text-sm`}>
          <ul className='relative mx-auto my-0  size-full list-none overflow-hidden py-0 pl-0 pr-12 text-center'>
            {/** Left */}
            <li className='float-left inline-block px-[3px] pt-[14px]'>
              <span
                className='h-full select-none rounded-sm px-[10px] text-white no-underline hover:text-cyber'
                onClick={() => openFileMenu()}
              >
                {t("file")}
              </span>
            </li>
            <li className='float-left inline-block px-[3px] pt-[14px]'>
              <a
                className='h-full select-none rounded-sm px-[10px] text-white no-underline hover:text-cyber'
                onClick={() => onClickSelectLang()}
              >
                {t("lang")}
              </a>
            </li>
            <li className='float-left hidden px-[3px] pt-[14px] md:inline-block'>
              <Link
                className='h-full select-none rounded-sm px-[10px] text-white no-underline hover:text-cyber'
                href='https://github.com/foasho/NinjaGL'
                target='_blank'
              >
                Github
              </Link>
            </li>
            <li className='float-left inline-block cursor-pointer px-[3px] pt-[14px] text-white'>
              <Link href='/docs' target='_blank'>
                {t("docs")}
              </Link>
            </li>
            {/** Center */}
            <li className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
              <span className='hidden h-full rounded-sm px-[10px] py-[5px] text-white no-underline hover:text-cyber md:inline-block'>
                NinjaGL
              </span>
              <a
                className='inline-block cursor-pointer text-white'
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
                    {t("nontitle")}
                  </>
                )}
              </a>
            </li>
            {/** Right */}
            <li className='float-right inline-block px-[3px] pt-[6px]'>
              <button
                className='flex cursor-pointer rounded-lg bg-cyber p-2 text-primary outline-none hover:bg-secondary hover:text-white disabled:opacity-50'
                disabled={loading}
                onClick={() => onSave()}
              >
                {loading ? (
                  <Spinner className='inline pr-2' size='sm' />
                ) : (
                  <AiFillSave className='inline size-5 pr-1' />
                )}
                <span className='hidden md:inline'>Save</span>
              </button>
            </li>
            <li className='float-right inline-block px-[3px] py-[12px]'>
              <a
                className='cursor-pointer rounded-lg bg-gray-300 p-2 text-primary hover:bg-gray-500'
                onClick={() => onPlayStop()}
              >
                <span className='align-middle'>
                  {viewSelect == "debugplay" ? (
                    <>
                      <BsStop className='inline size-6 pr-1' />
                    </>
                  ) : (
                    <>
                      <BsPlay className='inline size-6 pr-1' />
                    </>
                  )}
                </span>
                <span className='hidden md:inline'>{viewSelect == "debugplay" ? <>Stop</> : <>Play</>}</span>
              </a>
            </li>
          </ul>

          {showFileMenu && (
            <div className='fixed left-0 top-[45px] z-50 w-[160px] bg-primary text-white shadow-sm'>
              <ul className='m-0 list-none p-0 text-xs font-bold' onMouseLeave={() => handleFileMenuLeave()}>
                {/* <li><a>{t("newProject")}</a></li> ##WEBなので不要?  */}
                <li className='relative'>
                  <a className='block cursor-pointer rounded-sm p-2 no-underline' onClick={() => openProject()}>
                    {t("open")}
                  </a>
                </li>
                <li
                  className='relative'
                  onMouseEnter={() => handleRecentProjectsHover()}
                  onMouseLeave={() => handleSubMenuMouseLeave()}
                >
                  <a className='block cursor-pointer rounded-sm p-2 no-underline'>{t("recentProjects")}</a>
                  {showSubMenu && (
                    <ul
                      className='absolute left-[160px] top-0 z-10 min-w-[160px] overflow-hidden whitespace-nowrap bg-primary shadow-sm'
                      onMouseLeave={() => handleSubMenuMouseLeave()}
                    >
                      {recentProgects.map((pf, idx) => {
                        return (
                          <li key={idx} className='flex'>
                            <a className='block cursor-pointer p-2 no-underline'>{pf.name}</a>
                            <a className='block cursor-pointer p-2 no-underline'>{pf.path}</a>
                          </li>
                        );
                      })}
                      {recentProgects.length == 0 && (
                        <li className='flex'>
                          <a className=' p-2'>{t("noRecentData")}</a>
                        </li>
                      )}
                    </ul>
                  )}
                </li>
                <li className='relative'>
                  <a
                    className='block cursor-pointer select-none rounded-sm p-2 no-underline'
                    onClick={() => (globalEditorStore.autoSave = !autoSave)}
                  >
                    {autoSave ? <BsCheck className='inline-block pl-3 text-white' /> : <> </>}
                    {t("autoSave")}
                  </a>
                </li>
                <li className='relative'>
                  <Link href='/docs/help' className='block cursor-pointer rounded-sm p-2 no-underline'>
                    {t("help")}
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/** AppBarの開閉  */}
      <div className='fixed right-1.5 top-2.5 z-20'>
        <a
          className='cursor-pointer rounded-lg bg-transparent p-2 text-primary hover:bg-cyber/50'
          onClick={() => (globalEditorStore.appBar = !appBar)}
        >
          {appBar ? (
            <FaAngleUp className='inline pb-1 text-lg text-white' />
          ) : (
            <FaAngleDown className='inline pb-1 text-lg text-white' />
          )}
        </a>
      </div>
    </>
  );
};

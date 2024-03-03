import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { AiFillSave } from "react-icons/ai";
import { BiEditAlt } from "react-icons/bi";
import { BsCheck, BsPlay, BsStop } from "react-icons/bs";
import { FaAngleDown, FaAngleUp, FaFile, FaGithub, FaLanguage } from "react-icons/fa";
import Link from "next/link";
import { Spinner, useDisclosure } from "@nextui-org/react";
import { loadNJCFile, saveNJCBlob } from "@ninjagl/core";
import { useSession } from "next-auth/react";
import { useSnapshot } from "valtio";

import { MySwal } from "@/commons/Swal";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";
import { sendServerConfig, updateProjectData } from "@/utils/dataSync";

import { TemplateModal } from "../Dialogs/TemplateModal";
import { globalEditorStore } from "../Store/editor";
import { globalConfigStore } from "../Store/Store";
import { ExportNjcFile } from "../ViewPort/DebugPlay";

export const AppBarHeight = 45;
export const AppBar = () => {
  const { data: session } = useSession();
  const { t, i18n } = useTranslation();
  const [showFileMenu, setShowFileMenu] = useState<boolean>(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const configState = useSnapshot(globalConfigStore);
  const editorState = useSnapshot(globalEditorStore);
  const { projectName, autoSave, viewSelect, appBar } = editorState;
  const { oms, ums, tms, sms, setNJCFile, projectId, canvasRef } = useNinjaEditor();
  const [loading, setLoading] = useState(false);

  /**
   * プロジェクトが何もないときは、
   * BoxとPlane, DirectionalLight, SpotLightを追加
   * Environment(Sunset)を追加
   */
  useEffect(() => {
    // AutoSaveが有効かどうかを取得
    const autoSave = localStorage.getItem("autoSave");
    if (autoSave) {
      globalEditorStore.autoSave = true;
    }
    // ProjectIdがない場合は、テンプレートを開く
    if (!projectId) {
      onOpen();
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
        globalConfigStore.projectName = result.value;
        if (projectId) {
          sendServerConfig(projectId, configState);
        }
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
    if (loading) return;
    // Loadingでblobにまとめる
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
    const njcFile = ExportNjcFile(oms.current, ums.current, tms.current, sms.current, configState);
    const filename = `${name}.njc`;
    const blob = await saveNJCBlob(njcFile);
    const file = new File([blob], filename, { type: "application/octet-stream" });
    const href = window.URL.createObjectURL(file);
    // Save to Storage
    if (projectId) {
      // DBに同期する
      await updateProjectData(projectId, configState, oms.current, sms.current, canvasRef);
      if (completeAlert) {
        toast(
          <div>
            {t("completeSave")}
            <br />
            <a className='pt-2 text-xs text-cyan-400 underline' href={href} download={`${name}.njc`}>
              ダウンロード
            </a>
          </div>,
          {
            duration: 7500,
            position: "top-right",
          },
        );
      }
    } else {
      // ローカルでダウンロード
      const a = document.createElement("a");
      a.href = href;
      a.download = `${name}.njc`;
      a.click();
      a.remove();
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
    // AutoSaveが有効なら、AutoSaveを開始
    let autoSaveInterval;
    if (autoSave) {
      // 15分ごとに自動保存
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
          <ul className='relative mx-auto my-0  h-full w-full list-none overflow-hidden py-0 pl-0 pr-12 text-center'>
            {/** Left */}
            <li className='float-left inline-block px-[3px] pt-[14px]'>
              <span
                className='h-full cursor-pointer select-none rounded-sm px-[10px] text-white no-underline hover:text-cyber'
                onClick={() => openFileMenu()}
              >
                <FaFile className='mr-2 inline pb-0.5' />
                <span className='hidden md:inline'>{t("file")}</span>
              </span>
            </li>
            <li className='float-left inline-block px-[3px] pt-[14px]'>
              <a
                className='h-full cursor-pointer select-none rounded-sm px-[10px] text-white no-underline hover:text-cyber'
                onClick={() => onClickSelectLang()}
              >
                <FaLanguage className='mr-2 inline pb-0.5' />
                <span className='hidden md:inline'>{t("lang")}</span>
              </a>
            </li>
            <li className='float-left inline-block px-[3px] pt-[14px]'>
              <Link
                className='h-full cursor-pointer select-none rounded-sm px-[10px] text-white no-underline hover:text-cyber'
                href='https://github.com/foasho/NinjaGL'
                target='_blank'
              >
                <FaGithub className='mr-2 inline pb-0.5' />
                <span className='hidden md:inline'>Github</span>
              </Link>
            </li>
            {/** Center */}
            <li className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
              <span className='hidden h-full rounded-sm px-[10px] py-[5px] text-white no-underline hover:text-cyber md:inline-block'>
                <span className='hidden md:inline'>NinjaGL</span>
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
                    <span className='hidden md:inline'>{t("nontitle")}</span>
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
                  <AiFillSave className='inline h-5 w-5 pr-1' />
                )}
                <span className='hidden md:inline'>Save</span>
              </button>
            </li>
            <li className='float-right inline-block px-[3px] py-[12px]'>
              <a
                className='cursor-pointer rounded-lg bg-accent p-2 text-primary hover:bg-gray-500'
                onClick={() => onPlayStop()}
              >
                <span className='align-middle'>
                  {viewSelect == "debugplay" ? (
                    <>
                      <BsStop className='inline h-6 w-6 pr-1' />
                    </>
                  ) : (
                    <>
                      <BsPlay className='inline h-6 w-6 pr-1' />
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
                <li className='relative hover:bg-white/25'>
                  <Link href='/docs' target='_blank' className='block cursor-pointer rounded-sm p-2 no-underline'>
                    {t("docs")}
                  </Link>
                </li>
                <li className='relative hover:bg-white/25'>
                  <a className='block cursor-pointer rounded-sm p-2 no-underline' onClick={() => openProject()}>
                    {t("open")}
                  </a>
                </li>
                <li className='relative hover:bg-white/25'>
                  <a className='block cursor-pointer rounded-sm p-2 no-underline' onClick={onOpen}>
                    {t("templates")}
                  </a>
                </li>
                <li className='relative hover:bg-white/25'>
                  <a
                    className='block cursor-pointer select-none rounded-sm p-2 no-underline'
                    onClick={() => (globalEditorStore.autoSave = !autoSave)}
                  >
                    {autoSave ? <BsCheck className='mr-0.5 inline-block text-white' /> : <> </>}
                    {t("autoSave")}
                  </a>
                </li>
                <li className='relative hover:bg-white/25'>
                  <Link href='/docs/help' className='block cursor-pointer rounded-sm p-2 no-underline'>
                    {t("help")}
                  </Link>
                </li>
              </ul>
            </div>
          )}
          <TemplateModal isOpen={isOpen} onOpen={onOpen} onOpenChange={onOpenChange} />
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

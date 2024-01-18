"use client";
import { useSession } from "@ninjagl/auth/react";
import { useTranslation } from "react-i18next";

import { b64EncodeUnicode } from "@/commons/functional";
import { ModelViewer } from "@/commons/ModelViewer";
import { MySwal } from "@/commons/Swal";
import { IFileProps } from "@/editor/Hierarchy/ContentViewer";
import { isGLTF } from "@/utils/files";
import { uploadFile } from "@/utils/upload";

interface IAssetsContextMenuProps {
  position: {
    x: number;
    y: number;
  };
  file?: IFileProps;
  path?: string;
  onDeleteCallback?: () => void;
  onUploadCallback?: () => void;
}
export const AssetsContextMenu = (props: IAssetsContextMenuProps) => {
  const { position, file } = props;
  const { data: session } = useSession();
  const { t } = useTranslation();

  /**
   * 新規フォルダを作成
   */
  const onCreateFolder = () => {
    MySwal.fire({
      title: t("newFolderName").toString(),
      input: "text",
      showCancelButton: true,
      confirmButtonText: t("create").toString(),
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
    }).then(async (result) => {
      if (result.value) {
        let prefix = props.path?.includes(b64EncodeUnicode((session!.user as any).email))
          ? ""
          : `${b64EncodeUnicode((session!.user as any).email)}`;
        if (props.path) {
          let p = props.path;
          // 最後にスラッシュがついていれば外す
          if (p.endsWith("/")) {
            p = p.slice(0, -1);
          }
          // 最初にスラッシュがついていれば外す
          if (p.startsWith("/")) {
            p = p.slice(1);
          }
          prefix += "/" + p;
        }

        // ファイル名を設定
        const fileName = result.value + "/file.keep";
        let filePath = prefix + "/" + fileName;
        // 頭にスラッシュがついていれば外す
        if (filePath.startsWith("/")) {
          filePath = filePath.slice(1);
        }
        // textファイルを作成
        const file = new File([""], fileName, { type: "text/plain" });
        // サーバーに保存
        const res = await uploadFile(file, filePath);
        if (!res) {
          throw new Error("Error uploading file");
        }
        if (!res.url) {
          throw new Error("Error uploading file");
        }
        MySwal.fire({
          title: "フォルダを作成しました",
        });
        if (props.onUploadCallback) {
          props.onUploadCallback();
        }
      }
    });
  };

  /**
   * 特定のURLをダウンロードする
   * @param url
   */
  const onDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      const a = document.createElement("a");
      const objectUrl = URL.createObjectURL(blob);

      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  /**
   * URLをコピーする
   */
  const onCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      MySwal.fire({
        title: "コピーしました",
      });
    } catch (error) {
      console.error("Error copying file:", error);
    }
  };

  /**
   * 特定のURLを削除する
   */
  const deleteFile = async (url: string) => {
    try {
      const _url = `/api/storage/delete?url=${url}`;
      const response = await fetch(_url, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Error deleting file");
      }
      MySwal.fire({
        title: "削除に成功しました",
      });
    } catch (error) {
      throw error;
    }
    if (props.onDeleteCallback) {
      props.onDeleteCallback();
    }
  };

  return (
    <>
      <div
        style={{
          top: position.y,
          left: position.x,
        }}
        className='fixed z-20 rounded-md bg-white text-left shadow-lg'
      >
        {file && file.isFile && (
          <>
            {file.url && (
              <>
                <div
                  className='cursor-pointer select-none rounded px-4 py-3 text-primary hover:bg-primary/25'
                  onClick={() => onDownload(file.url, file.name)}
                >
                  {t("download")}
                </div>
                <div
                  className='cursor-pointer select-none rounded px-4 py-3 text-primary hover:bg-primary/25'
                  onClick={() => onCopyUrl(file.url)}
                >
                  {t("copyUrl")}
                </div>
                {session && (
                  <div
                    className='cursor-pointer select-none rounded px-4 py-3 text-primary hover:bg-primary/25'
                    onClick={() => deleteFile(file.url)}
                  >
                    {t("deleteFile")}
                  </div>
                )}
              </>
            )}
          </>
        )}
        {!file && session && (
          <>
            <div
              className='cursor-pointer select-none rounded px-4 py-3 text-primary hover:bg-primary/25'
              onClick={() => onCreateFolder()}
            >
              {t("newFolderName")}
            </div>
          </>
        )}
        {/** モデル */}
        {file && isGLTF(file.name) && (
          <>
            <div
              className='cursor-pointer select-none rounded px-4 py-3 text-primary hover:bg-primary/25'
              onClick={async () => {
                MySwal.fire({
                  title: t("showModelViewer"),
                  width: "50vw",
                  html: (
                    <div className='relative h-96 w-[50vw]'>
                      <ModelViewer url={file.url} />
                    </div>
                  ),
                });
              }}
            >
              {t("showModelViewer")}
            </div>
          </>
        )}
      </div>
    </>
  );
};

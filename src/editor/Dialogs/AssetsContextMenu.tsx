import React from "react";
import styles from "@/App.module.scss";
import { useSession } from "next-auth/react";
import { reqApi } from "@/services/ServciceApi";
import { IFileProps } from "@/editor/Hierarchy/ContentViewer";
import { useTranslation } from "react-i18next";
import { b64EncodeUnicode } from "@/commons/functional";
import Swal from "sweetalert2";

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
    Swal.fire({
      title: t("newFolderName").toString(),
      input: 'text',
      showCancelButton: true,
      confirmButtonText: t("create").toString(),
      showLoaderOnConfirm: true,
      preConfirm: async (inputStr) => {
        if (inputStr.length === 0) {
          return Swal.showValidationMessage(t("leastInput"));
        }
        return inputStr;
      },
      allowOutsideClick: function () {
        return !Swal.isLoading();
      }
    }).then((result) => {
      if (result.value) {
        let prefix = `users/${b64EncodeUnicode(session.user.email)}`;
        if (props.path){
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
        prefix += "/" + result.value;
        reqApi({ route: "storage/create-folder", data: { prefix: prefix } }).then(() => {
          if (props.onUploadCallback) props.onUploadCallback();
        });
      }
    });
  }
  
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
  }

  /**
   * 特定のURLを削除する
   */
  const deleteFile = async (url: string, filename: string) => {
    await reqApi({ route: "storage/delete", queryObject: { signedUrl: url } });
    props.onDeleteCallback();
  }

  /**
   * 新しいフォルダを作成する
   */
  
  return (
    <>
      <div
        style={{
          top: position.y,
          left: position.x,
        }}
        className={styles.assetsContextMenu}
      >
        {(file && file.isFile) && 
        <>
          {file.url &&
          <>
            <div className={styles.menuItem} onClick={() => onDownload(file.url, file.name)}>
              ダウンロード
            </div>
            <div className={styles.menuItem}>
              URLをコピー
            </div>
            {session &&
            <div className={styles.menuItem} onClick={() => deleteFile(file.url, file.name)}>
              ファイルを削除
            </div>
            }
          </>
          }
        </>
      }
      {!file && session &&
      <>
        <div className={styles.menuItem} onClick={() => onCreateFolder()}>
          新しいフォルダ作成
        </div>
      </>
      }
      </div>
    </>
  );
};
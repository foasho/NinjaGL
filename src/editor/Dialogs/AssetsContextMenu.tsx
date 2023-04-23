import React from "react";
import styles from "@/App.module.scss";
import { useSession } from "next-auth/react";
import { reqApi } from "@/services/ServciceApi";
import { IFileProps } from "@/editor/Hierarchy/ContentViewer";

interface IAssetsContextMenuProps {
  position: {
    x: number;
    y: number;
  };
  file?: IFileProps;
  onDeleteCallback?: () => void;
}
export const AssetsContextMenu = (props: IAssetsContextMenuProps) => {
  const { position, file } = props;
  const { data: session } = useSession();
  
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
  
  return (
    <>
      {(file && file.isFile) && 
      <div
        style={{
          top: position.y,
          left: position.x,
        }}
        className={styles.assetsContextMenu}
      >
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
      </div>
      }
    </>
  );
};
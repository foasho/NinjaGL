import React from "react";
import styles from "@/App.module.scss";

export const AssetsContextMenu = ({ position, file=undefined }) => {
  
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
          </>
          }
        </>
      </div>
      }
    </>
  );
};
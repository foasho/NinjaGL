import React from "react";
import styles from "@/App.module.scss";

export const AssetsContextMenu = ({ position, file=undefined }) => {
  
  /**
   * 特定のURLをダウンロードする
   * @param url 
   */
  const onDownload = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = url.split("/").pop();
    document.body.appendChild(a);
    a.click();
    a.remove();
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
            <div className={styles.menuItem} onClick={() => onDownload(file.url)}>
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
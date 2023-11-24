import React from 'react';

import { PutBlobResult } from '@vercel/blob';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';

import styles from '@/App.module.scss';
import { b64EncodeUnicode } from '@/commons/functional';
import { MySwal } from '@/commons/Swal';
import { IFileProps } from '@/editor/Hierarchy/ContentViewer';

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
      title: t('newFolderName').toString(),
      input: 'text',
      showCancelButton: true,
      confirmButtonText: t('create').toString(),
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
    }).then(async (result) => {
      if (result.value) {
        let prefix = props.path?.includes(b64EncodeUnicode((session!.user as any).email))
          ? ''
          : `${b64EncodeUnicode((session!.user as any).email)}`;
        if (props.path) {
          let p = props.path;
          // 最後にスラッシュがついていれば外す
          if (p.endsWith('/')) {
            p = p.slice(0, -1);
          }
          // 最初にスラッシュがついていれば外す
          if (p.startsWith('/')) {
            p = p.slice(1);
          }
          prefix += '/' + p;
        }
        // textファイルを作成
        const textFile = new Blob([''], { type: 'text/plain' });
        // ファイル名を設定
        const fileName = result.value + '/.keep';
        let uploadPath = prefix + '/' + fileName;
        // 頭にスラッシュがついていれば外す
        if (uploadPath.startsWith('/')) {
          uploadPath = uploadPath.slice(1);
        }
        // 新しいフォルダを作成する
        const response = await fetch(`/api/storage/upload?filename=${uploadPath}`, {
          method: 'POST',
          body: textFile,
        });
        const blob = (await response.json()) as PutBlobResult;
        console.log(blob);
        if (!blob.url) {
          throw new Error('Error uploading file');
        }
        MySwal.fire({
          title: 'フォルダを作成しました',
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

      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);

      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  /**
   * 特定のURLを削除する
   */
  const deleteFile = async (url: string) => {
    try {
      const _url = `/api/storage/delete?url=${url}`;
      const response = await fetch(_url, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error deleting file');
      }
      MySwal.fire({
        title: '削除に成功しました',
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
        className={styles.assetsContextMenu}
      >
        {file && file.isFile && (
          <>
            {file.url && (
              <>
                <div className={styles.menuItem} onClick={() => onDownload(file.url, file.name)}>
                  {t('download')}
                </div>
                <div className={styles.menuItem}>{t('copyUrl')}</div>
                {session && (
                  <div className={styles.menuItem} onClick={() => deleteFile(file.url)}>
                    {t('deleteFile')}
                  </div>
                )}
              </>
            )}
          </>
        )}
        {!file && session && (
          <>
            <div className={styles.menuItem} onClick={() => onCreateFolder()}>
              {t('newFolderName')}
            </div>
          </>
        )}
      </div>
    </>
  );
};

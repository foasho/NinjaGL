import { useEffect, useRef, useState } from 'react';
import styles from "@/App.module.scss";
import MonacoEditor from "@monaco-editor/react";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { reqApi } from '@/services/ServciceApi';
import { useTranslation } from 'react-i18next';

interface IScriptEditor {
  scriptPath: string;
  onChangeScriptPath: (path: string) => void;
}
export const ScriptEditor = (props: IScriptEditor) => {
  const [code, setCode] = useState<string>(initCode);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const { scriptPath } = props;
  const { t } = useTranslation();
  const handleEditorChange = (value) => {
    setCode(value);
  };

  /**
   * コードを保存する
   * @param script 
   * @param filename 
   * @returns 
   */
  const saveCode = async(script: string, filename: string) => {
    return reqApi({ 
      route: "savescript",
      data: { script: script, filename: filename } ,
      method: "POST"
    })
  }

  /**
   * 保存
   */
  const onSave = async () => {
    if (scriptPath){
      const len = scriptPath.split("/").length;
      const filename = scriptPath.split("/")[len - 1];
      await saveCode(code, filename);
      toast(t("save"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
    else {
      Swal.fire({
        title: 'ファイル名を決めてください',
        input: 'text',
        showCancelButton: true,
        confirmButtonText: '保存',
        showLoaderOnConfirm: true,
        preConfirm: async (inputStr: string) => {
          //バリデーションを入れたりしても良い
          if (inputStr.length == 0) {
            return Swal.showValidationMessage('1文字以上いれてね');
          }
          return inputStr.replace(".js", "");
        },
        allowOutsideClick: function () {
          return !Swal.isLoading();
        }
      }).then( async (result) => {
        if (result.value) {
          const filename = result.value + ".js";
          await saveCode(code, filename);
          toast(t("save"), {
            position: "top-right",
            autoClose: 2500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          props.onChangeScriptPath("scripts/"+filename);
        }
      });
    }
  }
  const handlerSave = (event) => {
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      onSave();
    }
  } 

  /**
   * プレビュー
   */
  const onPreview = () => {

  }

  /**
   * ファイル指定して起動する場合は、初期Codeはそのファイルを読み込む
   */
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    if (props.scriptPath){
      const fetchData = async () => {
        try {
          const response = await fetch(scriptPath, { signal });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.text();
          setCode(data);
        } catch (error) {
          if (error.name === 'AbortError') {
            console.log('Fetch aborted');
          } else {
            console.error('Error fetching data:', error);
          }
        }
      };
      fetchData();
    }
    // 保存をオーバーライド
    document.addEventListener('keydown', handlerSave);
    return () => {
      document.removeEventListener('keydown', handlerSave);
      controller.abort();
    };
  }, [scriptPath]);

  let filename = t("nonNameScript");
  if (scriptPath){
    const len = scriptPath.split("/").length;
    filename = scriptPath.split("/")[len - 1];
  }

  return (
    <>
    <div className={styles.scriptEditor}>
      <div className={styles.navigation}>
        <div className={styles.filename}>
          {filename}
        </div>
        <div className={styles.save} onClick={() => onSave()}>
          Save
        </div>
        <div className={styles.preview} onClick={() => onPreview()}>
          Preview
        </div>
      </div>
      <div className={styles.editor}>
        <MonacoEditor
          height="100%"
          width="100%"
          language="javascript"
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: 'line',
            automaticLayout: true,
          }}
        />
      </div>
    </div>
    </>
  )
}

const initCode = `
  /**
  * NinjaGL
  * -公式ドキュメント: https://www.example.com/
  * -公式サンプル    : https://www.example.com/
  **/
  const engine = this;
    
  /**
   *  呼び出し時
   */
  const init = () => {}

  /**
   * 毎フレーム事の処理
   * @param state: {  }
   * @param delta: 1フレーム時間(秒)
   */
  const frameLoop = (state, delta) => {

  }
`;
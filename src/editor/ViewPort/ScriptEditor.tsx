import { useEffect, useRef, useState } from 'react';
import styles from "@/App.module.scss";
import MonacoEditor, { Monaco } from "@monaco-editor/react";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { reqApi } from '@/services/ServciceApi';
import { useTranslation } from 'react-i18next';
import { Web3Instance } from '@/core/workers/Web3Instance';
import { IScriptManagement } from '@/core/utils/NinjaProps';
import { InitScriptManagement } from '@/core/utils/NinjaInit';
import { useSnapshot } from 'valtio';
import { globalScriptStore } from '../Store';


export const ScriptEditor = () => {
  const scriptState = useSnapshot(globalScriptStore);
  const [code, setCode] = useState<string>(initCode);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const { id, filePath, name } = scriptState.currentSM? scriptState.currentSM : InitScriptManagement;
  const { t } = useTranslation();
  const handleEditorChange = (value) => {
    setCode(value);
  };

  const loadCode = (script: string) => {
    const data = script.replace(
      `self['${id}'].initialize = initialize;\nself['${id}'].frameLoop = frameLoop;`,
       ""
    );
    return data;
  }

  /**
   * 予測変換を設定
   * @param monaco 
   */
  const handleEditorDidMount = (monaco: Monaco, editor) => {
    // 入力付加項目とSuggentionの設定
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model, position, token) => {
        // 現在のカーソル位置の前のテキストを取得します。
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        const suggestions = [];
        if (textUntilPosition.includes("Web3Instance.")) {
          suggestions.push({
            label: "getWalletAddress",
            kind: monaco.languages.CompletionItemKind.Function,
            documentation: "Get Wallet Address",
            insertText: "getWalletAddress()",
          });
        }
        else if (textUntilPosition.includes("EngineInstance.")){
          suggestions.push({
            label: "getObjectById",
            kind: monaco.languages.CompletionItemKind.Function,
            documentation: "Get ObjectData by Id",
            insertText: "getObjectById()",
          });
        }
        else{
          suggestions.push(
            {
              label: 'EngineInstance',
              kind: monaco.languages.CompletionItemKind.Module,
              documentation: 'EngineInstance',
              insertText: 'EngineInstance',
            },
            {
              label: 'Web3Instance',
              kind: monaco.languages.CompletionItemKind.Module,
              documentation: 'Web3Instance',
              insertText: 'Web3Instance',
            },
            {
              label: 'Web3Instance.getWalletAddress()',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Get Wallet Address',
              insertText: 'Web3Instance.getWalletAddress()',
            },
            {
              label: 'userData',
              kind: monaco.languages.CompletionItemKind.Variable,
              documentation: 'userData',
              insertText: 'userData',
            },
            {
              label: 'MyTesting',
              kind: monaco.languages.CompletionItemKind.Variable,
              documentation: 'MyTesting',
              insertText: 'MyTesting',
            },
          );
        }

        return Promise.resolve({ suggestions });
      },
    });
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
    if (filePath){
      const filename = name.replace(".js", "") + ".js";
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
    if (filePath){
      const fetchData = async () => {
        try {
          const response = await fetch(filePath, { signal });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.text();
          setCode(loadCode(data));
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
  }, [scriptState.currentSM]);

  return (
    <>
    <div className={styles.scriptEditor}>
      <div className={styles.navigation}>
        <div className={styles.filename}>
          {name}
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
          onMount={(editor, monaco) => handleEditorDidMount(monaco, editor)}
          // beforeMount={(monaco) => handleEditorWillMount(monaco)}
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

  /**
   *  呼び出し時
   */
  async function initialize() {
    // your code
  }

  /**
   * 毎フレーム事の処理
   * @param state: {  }
   * @param delta: 1フレーム時間(秒)
   */
  async function frameLoop(state, delta) {
    // your code
  }
`;
import { useContext, useEffect, useRef, useState } from 'react';
import styles from "@/App.module.scss";
import MonacoEditor, { Monaco } from "@monaco-editor/react";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { reqApi } from '@/services/ServciceApi';
import { useTranslation } from 'react-i18next';
// import { Web3Instance } from '@/core/workers/Web3Instance';
import { IScriptManagement } from '@/core/utils/NinjaProps';
import { InitScriptManagement } from '@/core/utils/NinjaInit';
import { useSnapshot } from 'valtio';
import { globalScriptStore } from '../Store';
import { AiOutlineCaretRight, AiOutlinePause, AiOutlineReload } from 'react-icons/ai';
import { editor } from 'monaco-editor';
import { NinjaEditorContext } from '../NinjaEditorManager';


export const ScriptEditor = () => {
  const myeditor = useContext(NinjaEditorContext);
  const scriptState = useSnapshot(globalScriptStore);
  // const [code, setCode] = useState<string>();
  const [pause, setPause] = useState<boolean>(true);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const { id, filePath, name, script } = scriptState.currentSM? scriptState.currentSM : {...InitScriptManagement};
  const code = useRef<string>(script);
  const { t } = useTranslation();
  const handleEditorChange = (value: string) => {
    if (code.current) code.current = value;
  };

  /**
   * 予測変換を設定
   * @param monaco 
   */
  const handleEditorDidMount = (monaco: any, editor: any) => {
    // 入力付加項目とSuggentionの設定
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: async (model:any, position:any, token:any) => {
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
  const saveCode = async(filename: string) => {
    const result = await reqApi({ 
      route: "savescript",
      data: { script: code.current, filename: filename } ,
      method: "POST"
    }).then(
      (res) => {
        if (res.status == 200){
          if (scriptState.currentSM && globalScriptStore.currentSM?.script !== null){
            if (script) globalScriptStore.setScript(script) // スクリプトデータを更新
          }
          else {
            const newSM: IScriptManagement = {
              id: id,
              type: "script",
              filePath: `scripts/${filename}`,
              name: filename,
              script: code.current,
            }
            myeditor.setSM(newSM);
            globalScriptStore.currentSM = newSM;
          }
          return true;
        }
        return false;
      }
    );
    if (result){
      toast(t("completeSave"), {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  }

  /**
   * 保存
   */
  const onSave = async () => {
    if (filePath){
      const filename = name.replace(".js", "") + ".js";
      await saveCode(filename);
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
          await saveCode(filename);

        }
      });
    }
  }
  const handlerSave = (event: any) => {
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      onSave();
    }
  } 

  /**
   * プレビュー
   */
  const onPreview = () => {
    setIsPreview(!isPreview);
  }

  /**
   * ファイル指定して起動する場合は、初期Codeはそのファイルを読み込む
   */
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    if (scriptState.currentSM && filePath){
      const fetchData = async () => {
        try {
          const response = await fetch(filePath, { signal });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const script = await response.text();
          // setCode(script);
          code.current = script;
        } catch (error: any) {
          if (error.name === 'AbortError') {
            console.log('Fetch aborted');
          } else {
            console.error('Error fetching data:', error);
          }
        }
      };
      fetchData();
    }
    else {
      code.current = initCode;
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
        {isPreview &&
        <>
          <div className={styles.preview}>
            <AiOutlineReload/>
          </div>
          <div className={styles.preview}> 
            {pause?<AiOutlinePause/>: <AiOutlineCaretRight/> }
          </div>
        </>
        }
      </div>
      <div className={styles.editor}>
        <MonacoEditor
          height="100%"
          width="100%"
          language="javascript"
          theme="vs-dark"
          value={code.current}
          onChange={(value: any) =>handleEditorChange(value)}
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
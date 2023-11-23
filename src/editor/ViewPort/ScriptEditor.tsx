import { useContext, useEffect, useRef, useState } from 'react';
import styles from "@/App.module.scss";
import MonacoEditor from "@monaco-editor/react";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { IScriptManagement } from '@ninjagl/core';
import { useSnapshot } from 'valtio';
import { globalScriptStore } from '../Store/Store';
import { AiOutlineCaretRight, AiOutlinePause, AiOutlineReload } from 'react-icons/ai';
import { useSession } from 'next-auth/react';
import { b64EncodeUnicode } from '@/commons/functional';
import { MathUtils } from 'three';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';


export const ScriptEditor = () => {
  const { data: session } = useSession();
  const myeditor = useNinjaEditor();
  const scriptState = useSnapshot(globalScriptStore);
  const [name, setName] = useState<string>();
  const [pause, setPause] = useState<boolean>(true);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const code = useRef<string>("");
  const { t } = useTranslation();

  /**
   * エディタの変更値を反映
   * @param value 
   */
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
          // @ts-ignore
          suggestions.push({
            label: "getWalletAddress",
            kind: monaco.languages.CompletionItemKind.Function,
            documentation: "Get Wallet Address",
            insertText: "getWalletAddress()",
          });
        }
        else if (textUntilPosition.includes("EngineInstance.")){
          // @ts-ignore
          suggestions.push({
            label: "getPositionByName",
            kind: monaco.languages.CompletionItemKind.Function,
            documentation: "Get ObjectPosition by Name",
            insertText: "getPositionByName()",
          });
        }
        else{
          // @ts-ignore
          suggestions.push({
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
   * スクリプトをbinary化
   */
  const convertFile = async (textData: string): Promise<File>=> {
    const blob = new Blob([textData], { type: "text/plain" });
    const file = new File([blob], "myTextFile.txt");
    return file;
  }

  /**
   * コードを保存する
   * @param script 
   * @param filename 
   * @returns 
   */
  const saveCode = async(filename: string) => {
    if (session && code.current){
      const file = await convertFile(code.current);
      const formData = new FormData();
      formData.append("file", file);
      const uploadPath = `users/${b64EncodeUnicode(session.user!.email as string)}/scripts`;
      const keyPath = (uploadPath + `/${filename}`).replaceAll("//", "/");
      formData.append("filePath", keyPath);
      const response = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Error uploading file");
      }
      if (response.ok){
        if (scriptState.currentSM && globalScriptStore.currentSM){
          const sm = myeditor.getSMById(scriptState.currentSM.id);
          if (sm) sm.script = code.current;
          globalScriptStore.currentSM.script = code.current;
        }
        else {
          const newSM: IScriptManagement = {
            id: scriptState.currentSM? scriptState.currentSM.id: MathUtils.generateUUID(),
            type: "script",
            name: filename,
            script: code.current,
          }
          myeditor.addSM(newSM);
          globalScriptStore.currentSM = newSM;
        }
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
    else {
      // ログインしてなければ、SMに追加のみおこなう
      if (scriptState.currentSM && code.current){
        globalScriptStore.currentSM!.script = code.current;
      }
      else {
        const newSM: IScriptManagement = {
          id: scriptState.currentSM? scriptState.currentSM.id: MathUtils.generateUUID(),
          type: "script",
          name: filename,
          script: code.current!,
        }
        myeditor.addSM(newSM);
        globalScriptStore.currentSM = newSM;
      }
    }
  }

  /**
   * 保存
   */
  const onSave = async () => {
    if (scriptState.currentSM){
      const filename = scriptState.currentSM.name.replace(".js", "") + ".js";
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
          setName(filename);
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
    if (scriptState.currentSM){
      code.current = scriptState.currentSM.script;
      setName(scriptState.currentSM.name);
    }
    else {
      code.current = initCode;
      setName(undefined);
    }
    // 保存をオーバーライド
    document.addEventListener('keydown', handlerSave);
    return () => {
      document.removeEventListener('keydown', handlerSave);
    };
  }, [scriptState.currentSM]);

  return (
    <>
    <div className={styles.scriptEditor}>
      <div className={styles.navigation}>
        <div className={styles.filename}>
          {name? name: "*Untitled.js"}
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
          options={{
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: 'line',
            automaticLayout: true,
            tabSize: 2,
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
 * @param state: { elapsedTime: 経過時間, mouse: { x, y } }
 * @param delta: 1フレーム時間(秒)
 * @param input: { forward, backward, left, right, jump, dash, action }
 */
async function frameLoop(state, delta, input) {
  // your code
}
`;
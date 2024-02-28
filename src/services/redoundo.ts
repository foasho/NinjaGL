/**
 * Redo/Undo 処理
 */
import type { IObjectManagement, IUIManagement } from "@ninjagl/core";

import { MutableRefObject, useEffect, useRef } from "react";
import { throttle } from "lodash-es";

import { globalEditorStore } from "@/editor/Store/editor";

interface IHistory {
  type: "add" | "remove" | "update";
  objectType: "object" | "ui"; // 今のところobjectのみ
  changedArg: string;
  om?: IObjectManagement;
  um?: IUIManagement;
}

const HISTORY_MAX = 30; // 履歴の最大数

export const useRedoUndo = ({
  oms,
  notifyOMsChanged,
  notifyOMIdChanged,
}: {
  oms: MutableRefObject<IObjectManagement[]>;
  notifyOMsChanged: () => void;
  notifyOMIdChanged: (id: string) => void;
}) => {
  const history = useRef<{ undo: IHistory[]; redo: IHistory[] }>({ undo: [], redo: [] });

  /**
   * undo/redo用の履歴を追加
   */
  const _addHistory = (type: "undo" | "redo", newHistory: IHistory) => {
    if (type === "undo") {
      history.current.undo.push(newHistory);
      if (history.current.undo.length > HISTORY_MAX) {
        history.current.undo.shift();
      }
    }
    if (type === "redo") {
      history.current.redo.push(newHistory);
      if (history.current.redo.length > HISTORY_MAX) {
        history.current.redo.shift();
      }
    }
  };
  const addHistory = throttle(_addHistory, 500);

  /**
   * 元に戻す
   */
  const undo = () => {
    if (history.current.undo.length === 0) {
      return;
    }
    const last = history.current.undo.pop();
    if (!last) {
      return;
    }
    if (last.objectType === "object" && last.om !== undefined) {
      if (last.type === "add") {
        // OMにidがあれば削除
        if (oms.current.find((om) => om.id === last.om!.id)) {
          oms.current = oms.current.filter((om) => om.id !== last.om!.id);
          // historyに追加
          addHistory("redo", {
            type: "remove",
            objectType: "object",
            changedArg: last.changedArg,
            om: last.om,
          });
          notifyOMsChanged();
        }
      }
      if (last.type === "remove") {
        // すでに同じIDがなければOMを追加
        if (!oms.current.find((om) => om.id === last.om!.id)) {
          // setOMs([...oms, last.om]);
          oms.current = [...oms.current, last.om];
          // historyに追加
          addHistory("redo", {
            type: "add",
            objectType: "object",
            changedArg: last.changedArg,
            om: last.om,
          });
          notifyOMsChanged();
        }
      }
      if (last.type === "update") {
        console.log("uhdo =>", history.current.undo);
        // OMを更新
        const target = oms.current.find((om) => om.id === last.om!.id);
        if (!target) {
          return;
        }
        console.log("prev args.position =>", target.args);
        target.args = { ...last.om!.args };
        console.log("next args.position =>", last.om!.args);
        notifyOMIdChanged(target.id);
        // historyに追加
        addHistory("redo", {
          type: "update",
          objectType: "object",
          changedArg: last.changedArg,
          om: target,
        });
      }
    }
  };

  /**
   * やり直し
   */
  const redo = () => {
    if (history.current.redo.length === 0) {
      return;
    }
    const last = history.current.redo.pop();
    if (!last) {
      return;
    }
    if (last.objectType === "object" && last.om !== undefined) {
      if (last.type === "add") {
        // すでに同じIDがなければOMを追加
        if (!oms.current.find((om) => om.id === last.om!.id)) {
          oms.current = [...oms.current, last.om];
          // historyに追加
          addHistory("undo", {
            type: "add",
            objectType: "object",
            changedArg: last.changedArg,
            om: last.om,
          });
          notifyOMsChanged();
        }
      }
      if (last.type === "remove") {
        // OMにIDがあれば削除
        if (oms.current.find((om) => om.id === last.om!.id)) {
          oms.current = oms.current.filter((om) => om.id !== last.om!.id);
          // historyに追加
          addHistory("undo", {
            type: "remove",
            objectType: "object",
            changedArg: last.changedArg,
            om: last.om,
          });
          notifyOMsChanged();
        }
      }
      if (last.type === "update") {
        // OMを更新
        const target = oms.current.find((om) => om.id === last.om!.id);
        if (!target) {
          return;
        }
        target.args = last.om.args;
        // historyに追加
        addHistory("undo", {
          type: "update",
          objectType: "object",
          changedArg: last.changedArg,
          om: target,
        });
      }
    }
  };

  const undoEvent = (e: KeyboardEvent) => {
    // mainviewのときのみ
    if (globalEditorStore.viewSelect !== "mainview") return;
    if (e.ctrlKey && e.key === "z") {
      undo();
    } else if (e.ctrlKey && e.key === "y") {
      redo();
    }
  };

  // Undo/Redoの履歴を初期化
  useEffect(() => {
    // Ctrl + Zでundo
    document.addEventListener("keydown", undoEvent);
    return () => {
      document.removeEventListener("keydown", undoEvent);
    };
  });

  return { undo, redo, addHistory };
};

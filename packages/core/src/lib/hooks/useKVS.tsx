import React, { createContext, useContext, useRef } from "react";
import { kvsProps } from "../utils";

type NinjaLVSProps = {
  kvs: kvsProps;
  getKVS: (key: string) => string | null;
  setKVS: (kvs: kvsProps) => void;
  createKVS: (key: string, value: string) => void;
  updateKVS: (key: string, value: string) => void;
  removeKVS: (key: string) => void;
  onKVSKeysChanged: (listener: () => void) => void;
  offKVSKeysChanged: (listener: () => void) => void;
  onKVSKeyChanged: (key: string, listener: () => void) => void;
  offKVSKeyChanged: (key: string, listener: () => void) => void;
};
const NinjaKVSContext = createContext({
  kvs: {},
  getKVS: (key: string) => null,
  setKVS: (kvs: kvsProps) => {},
  createKVS: (key: string, value: string) => {},
  updateKVS: (key: string, value: string) => {},
  removeKVS: (key: string) => {},
  onKVSKeysChanged: (listener: () => void) => {},
  offKVSKeysChanged: (listener: () => void) => {},
  onKVSKeyChanged: (key: string, listener: () => void) => {},
} as NinjaLVSProps);

export const useNinjaKVS = () => useContext(NinjaKVSContext);

type NinjaKVSProviderProps = {
  children: React.ReactNode;
  kvs?: kvsProps;
};
export const NinjaKVSProvider = ({ children, kvs={} }: NinjaKVSProviderProps) => {

  const getKVS = (key: string) => {
    return kvs[key] || null;
  };
  const setKVS = (kvs: kvsProps) => {
    Object.keys(kvs).forEach((key) => {
      kvs[key] = kvs[key];
    });
    notifyKVSKeysChanged();
  };
  const createKVS = (key: string, value: string) => {
    kvs[key] = value;
    notifyKVSKeysChanged();
  };
  const updateKVS = (key: string, value: string) => {
    kvs[key] = value;
    notifyKVSKeyChanged(key);
  };
  const removeKVS = (key: string) => {
    delete kvs[key];
    notifyKVSKeysChanged();
  };

  /**
   * Keys　Listener
   */
  const kvsKeysChangedListeners = useRef<(() => void)[]>([]);
  const onKVSKeysChanged = (listener: () => void) => {
    kvsKeysChangedListeners.current.push(listener);
  };
  const offKVSKeysChanged = (listener: () => void) => {
    kvsKeysChangedListeners.current = kvsKeysChangedListeners.current.filter(
      (l) => l !== listener
    );
  };
  // KVSの変更を通知する
  const notifyKVSKeysChanged = () => {
    kvsKeysChangedListeners.current.forEach((l) => l());
  };

  /**
   * Update Listener
   */
  const kvsKeyChangedListeners = useRef<{ [key: string]: (() => void)[] }>({});
  const onKVSKeyChanged = (key: string, listener: () => void) => {
    if (!kvsKeyChangedListeners.current[key]) {
      kvsKeyChangedListeners.current[key] = [];
    }
    kvsKeyChangedListeners.current[key].push(listener);
  };
  const offKVSKeyChanged = (key: string, listener: () => void) => {
    if (!kvsKeyChangedListeners.current[key]) {
      return;
    }
    kvsKeyChangedListeners.current[key] = kvsKeyChangedListeners.current[
      key
    ].filter((l) => l !== listener);
  };
  // 特定のKVS変更を通知する
  const notifyKVSKeyChanged = (key: string) => {
    if (!kvsKeyChangedListeners.current[key]) {
      return;
    }
    kvsKeyChangedListeners.current[key].forEach((l) => l());
  };

  return (
    <NinjaKVSContext.Provider
      value={{
        kvs,
        getKVS,
        setKVS,
        createKVS,
        updateKVS,
        removeKVS,
        onKVSKeysChanged,
        offKVSKeysChanged,
        onKVSKeyChanged,
        offKVSKeyChanged,
      }}
    >
      {children}
    </NinjaKVSContext.Provider>
  );
};

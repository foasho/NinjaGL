import { createContext, useContext, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type kvsProps = Record<string, any>;;

interface NinjaLVSProps {
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
}
const NinjaKVSContext = createContext<NinjaLVSProps>({
  kvs: {},
  getKVS: () => null,
  setKVS: () => void undefined,
  createKVS: () => void undefined,
  updateKVS: () => void undefined,
  removeKVS: () => void undefined,
  onKVSKeysChanged: () => void undefined,
  offKVSKeysChanged: () => void undefined,
  onKVSKeyChanged: () => void undefined,
  offKVSKeyChanged: () => void undefined,
});

export const useNinjaKVS = () => useContext(NinjaKVSContext);

interface NinjaKVSProviderProps {
  children: React.ReactNode;
}
export const NinjaKVSProvider = ({ children }: NinjaKVSProviderProps) => {
  const kvs: kvsProps = {};

  const getKVS = (key: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return kvs[key] ?? null;
  };
  const setKVS = (_kvs: kvsProps) => {
    Object.keys(_kvs).forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      kvs[key] = _kvs[key] ?? null;
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
   * KeysListener
   */
  const kvsKeysChangedListeners = useRef<(() => void)[]>([]);
  const onKVSKeysChanged = (listener: () => void) => {
    kvsKeysChangedListeners.current.push(listener);
  };
  const offKVSKeysChanged = (listener: () => void) => {
    kvsKeysChangedListeners.current = kvsKeysChangedListeners.current.filter((l) => l !== listener);
  };
  // KVSの変更を通知する
  const notifyKVSKeysChanged = () => {
    kvsKeysChangedListeners.current.forEach((l) => l());
  };

  /**
   * Update Listener
   */
  const kvsKeyChangedListeners = useRef<Record<string, (() => void)[]>>({});
  const onKVSKeyChanged = (key: string, listener: () => void) => {
    if (!kvsKeyChangedListeners.current[key]) {
      kvsKeyChangedListeners.current[key] = [];
    }
    kvsKeyChangedListeners.current[key]?.push(listener);
  };
  const offKVSKeyChanged = (key: string, listener: () => void) => {
    if (!kvsKeyChangedListeners.current[key]) {
      return;
    }
    const updatedKvsLisners = kvsKeyChangedListeners.current[key]?.filter((l) => l !== listener);
    if (updatedKvsLisners){
      kvsKeyChangedListeners.current[key] = updatedKvsLisners;
    }
  };
  // 特定のKVS変更を通知する
  const notifyKVSKeyChanged = (key: string) => {
    if (!kvsKeyChangedListeners.current[key]) {
      return;
    }
    kvsKeyChangedListeners.current[key]?.forEach((l) => l());
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

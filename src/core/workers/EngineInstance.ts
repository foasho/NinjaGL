
export class EngineInstance {
  constructor() {
  }

  public getOMByID(id: string) {
    self.postMessage({ type: "getOMByID", id: id });
  }

  public getOMByName(name: string) {
    self.postMessage({ type: "getOMByName", name: name });
}

  public getPosition(id: string) {
    self.postMessage({ type: "getPosition", id: id });
  }
  
}

(window as any).EngineInstance = new EngineInstance();
declare global {
  interface Window {
    EngineInstance: typeof EngineInstance;
  }
}
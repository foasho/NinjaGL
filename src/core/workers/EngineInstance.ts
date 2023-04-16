export class EngineInstance {
  public messageIdCounter = 0;
  public responseHandlers = new Map<number, (value: any) => void>();

  constructor() {
    self.addEventListener("message", this.handleResponseMessage.bind(this));
  }

  /**
   * 任意のメッセージを送る
   */
  public async requestMessage(type: string, data: any): Promise<any> {
    return new Promise((resolve) => {
      const messageId = this.messageIdCounter++;
      this.responseHandlers.set(messageId, resolve);
      self.postMessage({ type, data, messageId });

    });
  }

  /**
   * レスポンスメッセージを処理する
   */
  public handleResponseMessage(e: MessageEvent) {
    const { type, data, messageId } = e.data;
    if (type === "response") {
      const handler = this.responseHandlers.get(messageId);
      if (handler) {
        handler(data);
        this.responseHandlers.delete(messageId);
      }
    }
  }

  public async getPositionByName(name: string): Promise<any> {
    const data = await this.requestMessage("getPositionByName", { name });
    return data;
  }
}

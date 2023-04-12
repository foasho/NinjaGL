import Web3 from "web3";

/**
 * Web3.0用API接続インスタンス
 */
export class Web3Instance {
  constructor(worker) {
    this.worker = worker;
  }

  getWalletAddress() {
    this.worker.postMessage({ type: "GET_WALLET_ADDRESS" });
  }

  addEventListener(event, callback) {
    this.worker.addEventListener(event, callback);
  }
}

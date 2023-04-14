import Web3 from "web3";

export class Web3Instance {
  static instance: Web3Instance;
  web3: Web3;
  constructor() {
    this.web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.NEXT_PUBLIC_WEB3_PROVIDER)
    );
  }
  static getInstance() {
    if (!Web3Instance.instance) {
      Web3Instance.instance = new Web3Instance();
    }
    return Web3Instance.instance;
  }
}

// Add Web3Instance to the global scope
(window as any).Web3Instance = new Web3Instance();
declare global {
  interface Window {
    Web3Instance: typeof Web3Instance;
  }
}
import Web3 from "web3";

// Check if Web3 has been injected by the browser (Mist/MetaMask)
declare global {
    interface Window {
        web3: Web3;
        ethereum: any;
    }
}

/**
 * Web3.0用API接続インスタンス
 */
export class Web3Instance {

    // Web3.0でWalletアドレスを取得する
    getWalletAddress = async() =>{
        return new Promise((resolve, reject) => {
            window.ethereum.enable().then((accounts) => {
                resolve(accounts[0]);
            }).catch((error) => {
                reject(error);
            });
        });
    }
}
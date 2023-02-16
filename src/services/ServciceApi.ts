import axios from "axios";
import { AxiosRequestConfig } from "axios";

const BASE_URL = (process.env.REACT_APP_ENV=="prod")? process.env.REACT_APP_ENDPOINT: "";


// API 基本設定
export const sapi = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
        // 'Access-Control-Allow-Origin': '*'
    },
    // withCredentials: true
});

// seaapi.interceptors.request.use(
//     async (config: any | AxiosRequestConfig) => {
//         try {
//             if (process.env.REACT_APP_ENV == "prod") {
//                 config.params["API_KEY"] = "";
//                 return config;
//             }
//         }
//         catch (e) {
//             console.log("Token No Set");
//         }
//         return config;
//     }
// )

export interface IApiProps {
    route: string
}

/**
 * APIを利用する
 * @param params 
 * @returns 
 */
export const reqApi = async (props: IApiProps): Promise<any> => {
    return await sapi.get(
        BASE_URL + props.route
    )
    // return null
}
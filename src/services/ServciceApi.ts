import axios from "axios";
import { AxiosRequestConfig } from "axios";

const BASE_URL = (process.env.REACT_APP_ENV == "prod") ? process.env.REACT_APP_ENDPOINT : "";


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

export interface IApiProps {
  route: "filesize" | "uploadgltf" | "assets" | "savescript" | "saveshader";
  queryObject?: { [key: string]: string | number };
  method?: "GET" | "POST";
  contentType?: "json" | "form";
  formData?: FormData;
  data?: any;
}

/**
 * APIを利用する
 * @param params 
 * @returns 
 */
export const reqApi = async (props: IApiProps): Promise<any> => {
  let query = "";
  if (props.queryObject) {
    query = "?";
    Object.keys(props.queryObject).map((key: string, idx: number) => {
      if (idx > 0) {
        query += "&";
      }
      query += encodeURIComponent(key);
      query += "=";
      query += encodeURIComponent(props.queryObject[key]);
    });
  }
  if (props.method === undefined || props.method == "GET") {
    return await sapi.get(
      BASE_URL + "/api/" + props.route + query
    )
  }
  else {
    if (props.contentType == "form") {
      return await axios.post(
        "/api/" + props.route + query,
        props.formData,
        {
          timeout: 300000,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
    }
    else {
      sapi.options(BASE_URL, { headers: { 'Content-Type': 'application/json;charset=utf-8' } });
    }
    return await sapi.post(
      "/api/" + props.route + query,
      props.data
    )
  }
}
import axios from "axios";

const BASE_URL = process.env.REACT_APP_ENV == "prod" ? process.env.REACT_APP_ENDPOINT : "";

// API 基本設定
export const sapi = axios.create({
  baseURL: BASE_URL,
  timeout: 500000,
  headers: {
    "Content-Type": "application/json;charset=utf-8",
    // 'Access-Control-Allow-Origin': '*'
  },
  // withCredentials: true
});

export interface IApiProps {
  route:
    | "storage/list"
    | "storage/download"
    | "storage/upload"
    | "control/savescript"
    | "storage/delete"
    | "storage/create-folder";
  queryObject?: { [key: string]: string | number };
  data?: any;
}

const ConvertToMethod = (
  route:
    | "storage/list"
    | "storage/download"
    | "storage/create-folder"
    | "storage/upload"
    | "control/savescript"
    | "storage/delete",
): "GET" | "POST" | "DELETE" => {
  switch (route) {
    case "storage/delete":
      return "DELETE";
    case "storage/create-folder":
    case "control/savescript":
    case "storage/upload":
      return "POST";
    default:
      return "GET";
  }
};

/**
 * APIを利用する
 * @param params
 * @returns
 */
const baseAPIUrl = "/api/";
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
      query += encodeURIComponent(props.queryObject![key]);
    });
  }
  const method = ConvertToMethod(props.route);
  if (method == "GET") {
    return await sapi.get(BASE_URL + baseAPIUrl + props.route + query);
  } else if (method == "POST") {
    sapi.options(BASE_URL as any, { headers: { "Content-Type": "application/json;charset=utf-8" } });
    return await sapi.post("/api/" + props.route + query, props.data);
  } else if (method == "DELETE") {
    return await sapi.delete("/api/" + props.route + query);
  }
};
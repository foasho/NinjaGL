
/**
 * 現在のホストURLを取得する
*/
let CurrentHostUrl = "";
if (process.env.VERCEL_URL){
  CurrentHostUrl = "https://" + process.env.VERCEL_URL;
} else if (process.env.NEXTAUTH_URL){
  CurrentHostUrl = process.env.NEXTAUTH_URL;
}

const getCurrentHostUrl = () => {
  return CurrentHostUrl;
}

export { CurrentHostUrl, getCurrentHostUrl };
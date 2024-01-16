/**
 * @description ただのcssをReact.CSSPropertiesに変換する
 * @input '{"color": "blue", "font-size": "14px"}'
 * @output {"color": "blue", "fontSize": "14px"}
 */
export const convertCssProperties = (
  jsonString: string
): React.CSSProperties => {
  let obj = JSON.parse(jsonString);

  let convertedObj = Object.keys(obj).reduce((newObj: any, key: string) => {
    // ハイフンをキャメルケースに変換
    let convertedKey = key.replace(/-([a-z])/g, function (g) {
      return g[1].toUpperCase();
    });
    newObj[convertedKey] = obj[key];
    return newObj;
  }, {});

  return convertedObj as React.CSSProperties;
};

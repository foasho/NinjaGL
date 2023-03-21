

export class NinjaShader {
  Ready: boolean = false;
  dirName: string = "./glsls/";
  fileList: string[] = [];
  GLSLList: { [key: string]: string } = {};

  constructor(dirName?: string) {
    if (dirName) {
      this.dirName = dirName;
    }
  }

  /**
   * GLSLファイルをロードする
   * @param fileList 
   * @returns 
   */
  async load(fileList: string[]) {
    this.Ready = false;
    this.fileList = fileList;
    await (async () => {
      await Promise.all(fileList.map(async file => {
        await fetch(this.dirName + file)
          .then(response => response.text())
          .then(text => {
            this.GLSLList[file] = text;
          });
      }))
    })()
    this.Ready = true;
  }

  /**
   * 特定のファイルのGLSLファイルの中身を取得
   * @param fileName 
   * @returns 
   */
  getGLSLText(fileName: string): string {
    return this.GLSLList[fileName] ? this.GLSLList[fileName] : null;
  }

  /**
   * 新しいGLSLファイルをセットする
   */
  async setGLSLFile(fileName: string) {
    fetch(this.dirName + fileName)
      .then(response => response.text())
      .then(text => {
        this.GLSLList[fileName] = text;
      });
  }

}
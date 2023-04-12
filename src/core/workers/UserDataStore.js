
/**
 * ユーザー任意のデータを保持するためのクラス
 */
class UserDataStore {
  constructor() {
    this._data = {};
  }
  initialize = async () => {
    this._data = {};
  }
  get = (key) => {
    return this._data[key];
  }
  set = (key, value) => {
    this._data[key] = value;
  }
}

const userData = new UserDataStore();

export { userData };
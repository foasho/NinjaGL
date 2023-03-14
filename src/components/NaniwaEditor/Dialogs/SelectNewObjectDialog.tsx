import styles from "@/App.module.scss";
import { useState } from "react";
import ReactDOM from "react-dom";

const SelectNewObjectDialog = ({ response }) => {
  const handleClickOutside = (event) => {
    if (event.target.classList.contains(styles.selectNewObjectDialog)) {
      response("test");
    }
  };

  return ReactDOM.createPortal(
    <div
      className={styles.selectNewObjectDialog}
      onClick={handleClickOutside}
    >
      <div className={styles.dialog}>
        <h2>ダイアログ</h2>
        <p>ここにダイアログの内容が表示されます。</p>
      </div>
    </div>
    ,
    document.getElementById("myDialog")
  );
}

export const showSelectNewObjectDialog = async () => {
  return new Promise((resolve) => {
    const handleDialogClose = (value?: any) => {
      ReactDOM.unmountComponentAtNode(document.getElementById("myDialog"));
      console.log(value);
      resolve("ダイアログが閉じました");
    };

    ReactDOM.render(
      <SelectNewObjectDialog response={handleDialogClose} />, document.getElementById("myDialog")
    )
  });
};
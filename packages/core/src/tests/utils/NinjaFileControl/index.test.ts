import { describe, it, expect, vi } from 'vitest';
import JSZip from "jszip";
import {
  loadNJCFileFromURL,
  saveNJCBlob,
} from "../../../lib/utils/NinjaFileControl";
import { ThirdPersonTemplate } from "../../../lib/settings/tpTemplate";


it("Import NJC File", async () => {
  // const url = "/njcs/Sample.njc";
  // const file = await loadNJCFileFromURL(url);
  // expect(file).not.toBeUndefined();
  // expect(fetch).toHaveBeenCalledWith(url); // fetchが呼ばれたことを確認
});

// it("Export NJC File", async () => {
//   // const outputPath = `/dist/${Math.random().toString(32).substring(2)}.njc`;
//   const njcFile = ThirdPersonTemplate();
//   const blob = await saveNJCBlob(njcFile);
//   // blob(zipファイル)の中にglbファイルがあるかどうか
//   const zip = await JSZip.loadAsync(blob);
//   console.log(zip);
//   const glb = await zip.file("model.glb")?.async("blob");
//   expect(glb).not.toBeUndefined();
// });

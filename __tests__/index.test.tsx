import { render, waitForElementToBeRemoved } from "@testing-library/react";
import { NinjaEditor } from "../src/editor/NinjaEditor";

/**
 * NinjaEditorの描画テスト
 * @description DynamicImportしているので、lazyContentが表示されるまで待つ
 */
test("NinjaEditor", async () => {
  const { getByText } = render(<NinjaEditor />);
  const lazyContent = await waitForElementToBeRemoved(() => getByText(/NinjaGL/));
  expect(lazyContent).toBeInTheDocument();
});
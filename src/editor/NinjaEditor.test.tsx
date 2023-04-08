import { renderHook } from "@testing-library/react";
import { NinjaEditor } from "./NinjaEditor";

describe("NinjaEditor", () => {
    test("NinjaEditor", () => {
        const { result } = renderHook(() => NinjaEditor());
        expect(result.current)
    });
});
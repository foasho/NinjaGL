import type { StylesConfig, GroupBase, CSSObjectWithLabel } from "react-select";

export const normalStyles = {
  singleValue: (provided: CSSObjectWithLabel) => ({
    ...provided,
    color: "#fff",
  }),
  control: (styles: CSSObjectWithLabel) => ({
    ...styles,
    backgroundColor: "#111",
    borderColor: "#555",
  }),
  menu: (styles: CSSObjectWithLabel) => ({
    ...styles,
    backgroundColor: "#333",
  }),
  option: (styles: CSSObjectWithLabel, { isFocused, isSelected }: {
    isFocused: boolean;
    isSelected: boolean;
  }) => {
    return {
      ...styles,
      backgroundColor: isSelected ? "#555" : isFocused ? "#444" : "transparent",
      color: isSelected ? "#fff" : "#fff",
    };
  },
} satisfies StylesConfig<{
  value: string;
  label: string;
}, false, GroupBase<{
  value: string;
  label: string;
}>>;

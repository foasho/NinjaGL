export const normalStyles = {
  singleValue: (provided) => ({
    ...provided,
    color: "#fff",
  }),
  control: (styles) => ({
    ...styles,
    backgroundColor: "#111",
    borderColor: "#555",
  }),
  menu: (styles) => ({
    ...styles,
    backgroundColor: "#333",
  }),
  option: (styles, { isFocused, isSelected }) => {
    return {
      ...styles,
      backgroundColor: isSelected ? "#555" : isFocused ? "#444" : "transparent",
      color: isSelected ? "#fff" : "#fff",
    };
  },
};

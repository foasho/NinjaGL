"use client";
import { ToastContainer } from "react-toastify";

export const Toast = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      style={{zIndex:99999}}
    />
  )
}
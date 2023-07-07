'use client'
import { useRef } from 'react';
import dynamic from 'next/dynamic';

const Layout = ({ children }) => {
  return (
    <>
      {children}
    </>
  )
}

export { Layout }
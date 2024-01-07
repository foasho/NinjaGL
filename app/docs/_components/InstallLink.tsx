'use client';

import { usePWA } from '@/hooks/usePWA';

export const InstallLink = () => {
  const { InstallApplication } = usePWA();

  return <span className='cursor-pointer' onClick={() => InstallApplication()}>インストール</span>;
};

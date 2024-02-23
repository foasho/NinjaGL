import { Header } from "@/_components/Header";

import { AuthProvider } from "./provider";

interface Props {
  children: React.ReactNode;
}
export default function SecureLayout({ children }: Props) {
  return (
    <AuthProvider type='secure'>
      <Header />
      <div className='h-screen bg-black'>{children}</div>
    </AuthProvider>
  );
}

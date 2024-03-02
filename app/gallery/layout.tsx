import { Header } from "@/_components/Header";

interface Props {
  children: React.ReactNode;
}
export default function SecureLayout({ children }: Props) {
  return (
    <>
      <Header />
      <div className='h-screen bg-black'>{children}</div>
    </>
  );
}

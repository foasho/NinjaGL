import { Suspense } from "react";

import { Footer } from "./_components/Footer";
import { Header } from "./_components/Header";
import { HomeCanvas } from "./_components/HomeCanvas";

export default function HomePage() {
  return (
    <div className='relative h-screen w-full bg-[#504F56]' id="home">
      <Header />
      <Footer />
      <Suspense fallback={null}>
        <HomeCanvas />
      </Suspense>
    </div>
  );
}

import { Suspense } from "react";
import { HomeCanvas } from "./_components/HomeCanvas";
import { Header } from "./_components/Header";
import Link from "next/link";

export default function HomePage() {

  return (
    <>
      <Header />
      <div className="h-screen w-screen relative z-0">
        <div className="absolute top-0 left-0 z-20">
          {/** Hero Content Text */}
          <div className="absolute top-24 left-32 w-[50vw]">
              {/* Hero文字やタイトル等 */}
              <div className="px-4 md:pt-0 pt-[6.5rem] flex flex-col w-full justify-center text-gray-700 items-start text-center md:text-left select-none">
                <div
                  className="relative z-10 w-full text-center md:text-left pl-0 md:pl-6"
                >
                  <p className="uppercase tracking-loose w-full">
                    Web First Game Engine
                  </p>
                  <h1 className="mb-6 mt-2 text-3xl md:text-5xl font-bold leading-tight">
                    Let&apos;s Make <br />Third Person Game
                  </h1>
                  <p className="leading-normal md:text-xl text-sm mb-8">
                    Your Game, Your World
                    <br />
                    Light Physics Engine
                    <br />
                    Easy to Use
                    <br />
                    Fast to Start
                  </p>
                </div>

                {/* ボタンエリア */}
                <div className="flex flex-col md:flex-row w-full justify-center lg:justify-start pb-24 md:pb-0">
                  <div className="flex justify-center w-full md:w-auto">
                    <Link href="/editor">
                      <button
                        className="md:mx-2 hover:underline bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-white font-bold rounded-full my-1 md:my-3 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                      >
                        Get Started
                      </button>
                    </Link>
                  </div>
                  <div className="flex justify-center w-full md:w-auto">
                    <Link href="/login">
                      <button
                        className="md:mx-2 hover:underline bg-white text-gray-800 bg-opacity-25 font-bold rounded-full my-1 md:my-3 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                      >
                      Login
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
        </div>
        <div className="w-full h-[100vh] absolute z-10 top-0 left-0">
          <Suspense>
            <HomeCanvas />
          </Suspense>
        </div>
      </div>
    </>
  )
}
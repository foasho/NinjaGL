"use client";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link } from "@nextui-org/react";
import { signOut, useSession } from "@ninjagl/auth";

export const Header = () => {
  const session = useSession();

  return (
    <>
      <Navbar className='fixed z-30 p-3 top-0 w-screen bg-transparent text-white'>
        <NavbarBrand>
          {/* <AcmeLogo /> */}
          <p className='cursor-pointer font-bold text-inherit'>
            <Link href='/' className='text-white'>
              NinjaGL
            </Link>
          </p>
        </NavbarBrand>
        <NavbarContent justify='end'>
          <NavbarItem className='lg:flex'>
            <Link
              href='/editor'
              className='cursor-pointer rounded-full bg-cyber px-4 py-2 text-primary hover:bg-cyber/75 hover:text-white'
            >
              Start
            </Link>
          </NavbarItem>
          <NavbarItem className='lg:flex'>
            <Link href='/docs' className='text-white'>
              Docs
            </Link>
          </NavbarItem>

          <NavbarItem className='lg:flex'>
            {!session && (
              <Link href='/login' className='text-white'>
                Login
              </Link>
            )}
            {session && (
              <span className='text-white' onClick={() => signOut()}>
                Logout
              </span>
            )}
          </NavbarItem>
        </NavbarContent>
      </Navbar>
    </>
  );
};

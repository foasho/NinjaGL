"use client";
import { Link, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";
import { signOut } from "@ninjagl/auth";
import { useSession } from "@ninjagl/auth/react";

export const Header = () => {
  const { data: session } = useSession();

  return (
    <>
      <Navbar className='fixed top-0 z-30 w-screen bg-transparent p-3 text-white'>
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

import { Link } from "@nextui-org/link";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/navbar";
import { getServerSession } from "next-auth";

import { LogoutItem } from "./Logout";

export const Header = async () => {
  const session = await getServerSession();

  return (
    <>
      <Navbar className='fixed top-0 z-30 w-screen bg-transparent p-3 text-white'>
        <NavbarBrand>
          <p className='cursor-pointer font-bold text-inherit'>
            <Link href='/' className='text-white'>
              NinjaGL
            </Link>
          </p>
        </NavbarBrand>
        <NavbarContent justify='end'>
          <NavbarItem className='md:flex'>
            <Link
              href='/editor'
              className='cursor-pointer rounded-full bg-cyber px-4 py-2 text-primary hover:bg-cyber/75 hover:text-white'
            >
              Start
            </Link>
          </NavbarItem>
          <NavbarItem className='hidden md:flex'>
            <Link href='/gallery' className='text-white'>
              Gallery
            </Link>
          </NavbarItem>
          {session && (
            <NavbarItem className='md:flex'>
              <Link href='/projects' className='text-white'>
                Projects
              </Link>
            </NavbarItem>
          )}

          {!session && (
            <NavbarItem className='md:flex'>
              <Link href='/login' className='text-white'>
                Login
              </Link>
            </NavbarItem>
          )}
          {session && <LogoutItem />}
        </NavbarContent>
      </Navbar>
    </>
  );
};

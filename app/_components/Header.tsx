"use client";
import { signOut, useSession } from "next-auth/react";
import {
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem, 
  Link, 
  Button
} from "@nextui-org/react";

export const Header = () => {

  const { data: session, status } = useSession();

  return (
    <>
      <Navbar className="bg-primary text-white">
        <NavbarBrand>
          {/* <AcmeLogo /> */}
          <p className="font-bold text-inherit cursor-pointer">
            <Link href="/" className="text-white">
              NinjaGL
            </Link>
          </p>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link color="foreground" href="#">
              {/** Any */}
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem className="hidden lg:flex">
            {!session && <Link href="/login" className="text-white">Login</Link>}
            {session && <span className="text-white" onClick={() => signOut()}>Logout</span>}
          </NavbarItem>
        </NavbarContent>
      </Navbar>
    </>
  );
}
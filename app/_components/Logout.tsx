"use client";
import { NavbarItem } from "@nextui-org/react";
import { signOut } from "next-auth/react";

export const LogoutItem = () => {
  return (
    <NavbarItem className='lg:flex'>
      <span className='text-white' onClick={() => signOut()}>
        Logout
      </span>
    </NavbarItem>
  );
};

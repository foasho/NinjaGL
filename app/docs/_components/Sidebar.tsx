import Image from "next/image";
import { AiOutlineSearch } from "react-icons/ai";
import {Navbar, Input, NavbarBrand, NavbarContent, NavbarItem, Link, Button} from "@nextui-org/react";

export const SideBar = () => {
  return (
    <Navbar className="shadow">
      <NavbarBrand>
        {/* <AcmeLogo /> */}
        <p className="font-bold text-inherit">NinjaGL Docs</p>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="#">
            Usages
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="#">
            Scripts
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            Tutorial
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <Input
          classNames={{
            base: "max-w-full sm:max-w-[12rem] h-10",
            mainWrapper: "h-full",
            input: "text-small",
            inputWrapper: "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
          }}
          placeholder="Type to search..."
          size="sm"
          startContent={<AiOutlineSearch className="inline " />}
          type="search"
        />
      </NavbarContent>
    </Navbar>
  );
};

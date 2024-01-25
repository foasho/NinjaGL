import { Navbar, Input, NavbarBrand, NavbarContent, NavbarItem, Link } from "@nextui-org/react";
import { AiOutlineSearch } from "react-icons/ai";

import { InstallLink } from "./InstallLink";
import { StartedBtn } from "./StartedBtn";
import { TutorialMenu } from "./TutorialMenu";

export const SideBar = () => {
  return (
    <Navbar className='bg-transparent shadow'>
      <NavbarBrand>
        {/* <AcmeLogo /> */}
        <p className='font-bold text-inherit'>
          <Link href='/docs'>NinjaGL Docs</Link>
        </p>
      </NavbarBrand>
      <NavbarContent className='hidden gap-4 sm:flex' justify='center'>
        <NavbarItem>
          <Link href='/'>ホーム</Link>
        </NavbarItem>
        <NavbarItem>
          <InstallLink />
        </NavbarItem>
        <TutorialMenu />
      </NavbarContent>
      <NavbarContent justify='end'>
        <Input
          classNames={{
            base: "max-w-full sm:max-w-[12rem] h-10",
            mainWrapper: "h-full",
            input: "text-small",
            inputWrapper: "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
          }}
          placeholder='検索...'
          size='sm'
          startContent={<AiOutlineSearch className='inline ' />}
          type='search'
        />
        <StartedBtn />
      </NavbarContent>
    </Navbar>
  );
};

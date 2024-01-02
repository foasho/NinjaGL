import { Navbar, Input, NavbarBrand, NavbarContent, NavbarItem, Link, Dropdown, DropdownMenu, DropdownItem, Button, DropdownTrigger } from '@nextui-org/react';
import { AiOutlineSearch } from 'react-icons/ai';

import { StartedBtn } from './StartedBtn';
import { TutorialMenu } from './TutorialMenu';

export const SideBar = () => {



  return (
    <Navbar className='shadow'>
      <NavbarBrand>
        {/* <AcmeLogo /> */}
        <p className='font-bold text-inherit'>NinjaGL Docs</p>
      </NavbarBrand>
      <NavbarContent className='hidden gap-4 sm:flex' justify='center'>
        <NavbarItem>
          <Link color='foreground' href='#'>
            インストール
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href='/docs/scripts'>Scripts</Link>
        </NavbarItem>
        <TutorialMenu />
      </NavbarContent>
      <NavbarContent justify='end'>
        <Input
          classNames={{
            base: 'max-w-full sm:max-w-[12rem] h-10',
            mainWrapper: 'h-full',
            input: 'text-small',
            inputWrapper: 'h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20',
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

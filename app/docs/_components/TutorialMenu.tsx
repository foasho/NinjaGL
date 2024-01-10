"use client";
import { NavbarItem, Dropdown, DropdownMenu, DropdownItem, Button, DropdownTrigger } from "@nextui-org/react";
import Link from "next/link";
import { FaReact } from "react-icons/fa";
import { HiChevronDown } from "react-icons/hi2";

import { cardItems } from "../_utils/tutorials";

export const TutorialMenu = () => {
  return (
    <Dropdown>
      <NavbarItem>
        <DropdownTrigger>
          <Button
            disableRipple
            className='bg-transparent p-0 data-[hover=true]:bg-transparent'
            endContent={<HiChevronDown fill='currentColor' size={16} />}
            radius='sm'
            variant='light'
          >
            チュートリアル
          </Button>
        </DropdownTrigger>
      </NavbarItem>
      <DropdownMenu
        aria-label='ACME features'
        className='w-[340px]'
        itemClasses={{
          base: "gap-4",
        }}
      >
        <>
          <DropdownItem
            description='NinjaGLでできる簡単なチュートリアル一覧'
            startContent={<FaReact className='p-1 text-primary' fill='currentColor' size={30} />}
            as={Link}
            href='/docs/tutorial'
          >
            チュートリアル一覧
          </DropdownItem>
          {cardItems.map((item, index) => {
            return (
              <DropdownItem
                key={index}
                description={item.description}
                startContent={item.icon}
                as={Link}
                href={item.href}
              >
                {item.title}
              </DropdownItem>
            );
          })}
        </>
      </DropdownMenu>
    </Dropdown>
  );
};

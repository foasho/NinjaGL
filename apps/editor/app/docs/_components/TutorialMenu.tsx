"use client";
import { HiChevronDown } from "react-icons/hi2";
import Link from "next/link";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, NavbarItem } from "@nextui-org/react";

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
      </DropdownMenu>
    </Dropdown>
  );
};

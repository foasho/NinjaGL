"use client";
import Link from "next/link";
import { DropdownItem } from "@nextui-org/react";

export const TutorialItem = () => {
  return (
    <DropdownItem
      key='tutorial'
      description='NinjaGLでできる簡単なチュートリアル一覧'
      // startContent={<FaReact className='p-1 text-primary' fill='currentColor' size={30} />}
      as={Link}
      href='/docs/tutorial'
    >
      チュートリアル一覧
    </DropdownItem>
  );
};

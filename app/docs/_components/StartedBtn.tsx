"use client";

import { Button } from "@nextui-org/react";
import Link from "next/link";

export const StartedBtn = () => {
  return (
    <Button as={Link} href='/editor' color='primary'>
      始める
    </Button>
  );
};

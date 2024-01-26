"use client";

import Link from "next/link";
import { Button } from "@nextui-org/react";

export const StartedBtn = () => {
  return (
    <Button as={Link} href='/editor' color='primary'>
      始める
    </Button>
  );
};

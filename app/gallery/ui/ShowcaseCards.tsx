"use client";
import { HiArrowTopRightOnSquare } from "react-icons/hi2";
import Link from "next/link";
import { Button, Card, CardFooter, Image } from "@nextui-org/react";

import { ProjectData } from "@/db/types";

type ShowcaseTableProps = {
  projects: ProjectData[];
};
export const ShowcaseCards = ({ projects }: ShowcaseTableProps) => {
  return (
    <div className='mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
      {projects.map((project, idx) => (
        <Card isFooterBlurred radius='lg' className='border-none' key={idx}>
          <Image
            alt='Woman listing to music'
            className='object-cover'
            height={200}
            src={project.preview ?? "/docs/starter.png"}
            width={200}
          />
          <CardFooter className='absolute bottom-1 z-10 ml-1 flex w-[calc(100%_-_8px)] justify-between overflow-hidden rounded-large border-1 border-white/20 py-1 shadow-small before:rounded-xl before:bg-white/10'>
            <div>{project.name}</div>
            <div></div>
            <Button
              as={Link}
              href={`/editor/preview?projectId=${project.id}`}
              className='justify-end bg-black/20 text-tiny text-white'
              variant='flat'
              color='default'
              radius='lg'
              size='sm'
              startContent={<HiArrowTopRightOnSquare className='inline' />}
            >
              Open..
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

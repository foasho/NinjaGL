"use client";

import { Button, Card, CardFooter, Image } from "@nextui-org/react";

import { ProjectData } from "@/db/types";

type ShowcaseTableProps = {
  projects: ProjectData[];
};
export const ShowcaseCards = ({ projects }: ShowcaseTableProps) => {
  return (
    <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
      {projects.map((project, idx) => (
        <Card isFooterBlurred radius='lg' className='border-none' key={idx}>
          <Image
            alt='Woman listing to music'
            className='object-cover'
            height={200}
            src='/images/tp1.jpg'
            width={200}
          />
          <CardFooter className='absolute bottom-1 z-10 ml-1 w-[calc(100%_-_8px)] justify-between overflow-hidden rounded-large border-1 border-white/20 py-1 shadow-small before:rounded-xl before:bg-white/10'>
            <p className='text-tiny text-white/80'>{project.name}</p>
            <Button className='bg-black/20 text-tiny text-white' variant='flat' color='default' radius='lg' size='sm'>
              Open..
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

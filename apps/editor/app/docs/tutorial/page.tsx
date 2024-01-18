"use client";
import { FaStopwatch } from "react-icons/fa";
import Link from "next/link";
import { Card, CardBody, CardFooter, Image } from "@nextui-org/react";

import { cardItems } from "../_utils/tutorials";

const TutorialPage = () => {
  return (
    <>
      <div>
        <h1 className='text-3xl font-bold'>チュートリアル</h1>
        <p className='text-default-500'>NinjaGLの機能を学ぶためのチュートリアルです</p>
      </div>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {cardItems.map((item, index) => (
          <Card shadow='sm' as={Link} href={item.href} key={index} isPressable onPress={() => {}}>
            <CardBody className='overflow-visible p-0'>
              <Image
                shadow='sm'
                radius='lg'
                width='100%'
                alt={item.title}
                className='m-0 h-[240px] w-full object-cover'
                src={item.img}
              />
            </CardBody>
            <CardFooter className='justify-between text-small'>
              <b>{item.title}</b>
              <p className='m-0 text-default-500'>
                <FaStopwatch className='mr-1 inline' />
                {item.time}
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
};

export default TutorialPage;

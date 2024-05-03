"use client";
import { HiPlay, HiRocketLaunch } from "react-icons/hi2";
import Link from "next/link";
import { Button, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, User } from "@nextui-org/react";

import { InviteButton } from "./InviteButton";

export const ProjectsTable = ({ projects }) => {
  return (
    <Table isHeaderSticky aria-label='Example static collection table' classNames={{
      base: "max-h-[calc(100vh-200px)] overflow-scroll",
      table: "min-h-[calc(100vh-320px)]",
    }}>
      <TableHeader>
        <TableColumn>プロジェクト名</TableColumn>
        <TableColumn>公開状態</TableColumn>
        <TableColumn>更新日</TableColumn>
        <TableColumn className='min-w-48'>操作</TableColumn>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell>
              <User
                avatarProps={{radius: "lg", src: project.image}}
                description={project.description}
                name={project.name}
              >
                {project.name}
              </User>
            </TableCell>
            <TableCell>{project.publish ? "公開中" : "非公開"}</TableCell>
            <TableCell>{project.updatedAt?.toString()}</TableCell>
            <TableCell className='flex gap-2'>
              <Button
                target='_blank'
                color='primary'
                size='sm'
                as={Link}
                href={`/editor?id=${project.id}`}
                startContent={<HiRocketLaunch className='inline' />}
              >
                編集
              </Button>
              <InviteButton projectId={project.id} />
              <Button
                target='_blank'
                color='primary'
                size='sm'
                as={Link}
                href={`/editor/preview?projectId=${project.id}`}
                startContent={<HiPlay className='inline' />}
              ></Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

"use client";
import { HiPlay, HiRocketLaunch } from "react-icons/hi2";
import Link from "next/link";
import { Button, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";

import { InviteButton } from "./InviteButton";

export const ProjectsTable = ({ projects }) => {
  return (
    <Table aria-label='Example static collection table'>
      <TableHeader>
        <TableColumn>プロジェクト名</TableColumn>
        <TableColumn>説明</TableColumn>
        <TableColumn>公開状態</TableColumn>
        <TableColumn>更新日</TableColumn>
        <TableColumn className='min-w-48'>操作</TableColumn>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell>{project.name}</TableCell>
            <TableCell>{project.description}</TableCell>
            <TableCell>{project.publish ? "公開中" : "非公開"}</TableCell>
            <TableCell>{project.updatedAt?.toString()}</TableCell>
            <TableCell className='grid grid-cols-3 gap-4'>
              <Button
                target='_blank'
                color='primary'
                size='sm'
                as={Link}
                href={`/editor?id=${project.id}`}
                startContent={<HiRocketLaunch className='inline' />}
              >
                開く
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

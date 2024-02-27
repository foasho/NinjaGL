"use client";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { HiCube, HiInformationCircle } from "react-icons/hi2";
import {
  Button,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";

import { createProjectAction } from "../actions";

export const CreateButton = () => {
  const { pending } = useFormStatus();
  const createProjectActionBind = createProjectAction.bind(null, {});
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [publish, setPublish] = useState(true);

  return (
    <div>
      <Button onPress={onOpen} className='bg-cyber'>
        Create
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <form
              action={async (formData) => {
                await createProjectActionBind(formData);
                onClose();
              }}
            >
              <ModalHeader className='flex flex-col gap-1'>新しいプロジェクトを作成</ModalHeader>
              <ModalBody>
                {/** Project Name */}
                <Input
                  autoFocus
                  name='name'
                  endContent={<HiCube className='pointer-events-none shrink-0 text-2xl text-default-400' />}
                  label='プロジェクト名'
                  placeholder=''
                  variant='bordered'
                />
                {/** Description */}
                <Input
                  name='description'
                  endContent={
                    <HiInformationCircle className='pointer-events-none shrink-0 text-2xl text-default-400' />
                  }
                  label='プロジェクトの説明'
                  placeholder=''
                  variant='bordered'
                />
                {/** Publish */}
                <Checkbox isSelected={publish} onValueChange={setPublish} size='md' name='publish' color='primary'>
                  プレビューを常に公開する
                </Checkbox>
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  キャンセル
                </Button>
                <Button color='primary' type='submit' isLoading={pending} disabled={pending}>
                  作成
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

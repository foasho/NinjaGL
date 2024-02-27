"use client";
import { useState } from "react";
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

export const CreateButton = ({ createProjectAction }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
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
                setIsLoading(true);
                await createProjectAction(formData);
                onClose();
                setIsLoading(false);
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
                <Button color='primary' type='submit' isLoading={isLoading} disabled={isLoading}>
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

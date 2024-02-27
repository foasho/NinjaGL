"use client";
import { useState } from "react";
import { HiEnvelope } from "react-icons/hi2";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";

export const InviteButton = ({ projectId, inviteUserInvitationAction }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div>
      <Button size='sm' onPress={onOpen} className='bg-accent'>
        招待
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <form
              action={async (formData) => {
                setIsLoading(true);
                await inviteUserInvitationAction(formData);
                onClose();
                setIsLoading(false);
              }}
            >
              <ModalHeader className='flex flex-col gap-1'>プロジェクトに招待</ModalHeader>
              <ModalBody>
                {/** Emailで招待 */}
                <Input
                  autoFocus
                  name='email'
                  endContent={<HiEnvelope className='pointer-events-none shrink-0 text-2xl text-default-400' />}
                  label='メールアドレス'
                  placeholder=''
                  variant='bordered'
                />
                <Input name='projectId' type='number' className='hidden' value={projectId.toString()} />
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  キャンセル
                </Button>
                <Button color='primary' type='submit'>
                  招待
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

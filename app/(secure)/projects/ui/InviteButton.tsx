"use client";
import { useFormStatus } from "react-dom";
import { HiEnvelope } from "react-icons/hi2";
import { useRouter } from "next/navigation";
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
import { useSession } from "next-auth/react";

import { inviteUserInvitationAction } from "../client-actions";

export const InviteButton = ({ projectId }) => {
  const { pending } = useFormStatus();
  const router = useRouter();
  // ClientActionsで実装
  // const inviteUserInvitationActionBind = inviteUserInvitationAction.bind(null, projectId);
  const { data: session } = useSession();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
                await inviteUserInvitationAction(session!, formData);
                onClose();
                router.push("/projects");
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
                <Button color='primary' type='submit' isLoading={pending} disabled={pending}>
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

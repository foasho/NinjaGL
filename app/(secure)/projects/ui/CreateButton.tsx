"use client";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import toast from "react-hot-toast";
import { HiCamera, HiCube, HiInformationCircle } from "react-icons/hi2";
import { useRouter } from "next/navigation";
import {
  Button,
  Checkbox,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { useSession } from "next-auth/react";

import { createProjectAction } from "../client-actions";

export const CreateButton = () => {
  const { pending } = useFormStatus();
  const [logo, setLogo] = useState<File | null>(null);
  const router = useRouter();
  // ClientActionsで実装
  // const createProjectActionBind = createProjectAction.bind(null, {});
  const { data: session } = useSession();
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
                // validate
                if (!formData.get("name") || !formData.get("image")) {
                  toast.error("プロジェクト名と画像は必須です");
                  return;
                }
                await createProjectAction(session!, formData);
                onClose();
                router.refresh();
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
                  required
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
                <label htmlFor='logo' className='block text-sm font-medium text-gray-700'>
                  プロジェクトのロゴ
                </label>
                <div className='flex'>
                  <Image
                    alt='logo'
                    height={52}
                    radius='sm'
                    className='p-2'
                    src={logo ? URL.createObjectURL(logo) : "/icons/photo-camera.png"}
                    width={52}
                  />
                  <Input
                    name='image'
                    type='file'
                    accept='image/*'
                    size='sm'
                    className='pl-2'
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLogo(file);
                      }
                    }}
                    endContent={<HiCamera className='pointer-events-none shrink-0 text-2xl text-default-400' />}
                  />
                </div>
                {/** Publish */}
                <Checkbox
                  isSelected={publish}
                  value={publish.toString()}
                  onValueChange={setPublish}
                  size='md'
                  name='publish'
                  color='primary'
                  defaultSelected
                >
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

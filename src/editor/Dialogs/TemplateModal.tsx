import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CircularProgress,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

import { MySwal } from "@/commons/Swal";
import { TemplateProps, useNinjaEditor } from "@/hooks/useNinjaEditor";

type TeplateItemProps = {
  title: string;
  img: string;
  value: TemplateProps;
};

type Props = {
  isOpen: boolean;
  onOpen: () => void;
  onOpenChange: (isOpen: boolean) => void;
};
export const TemplateModal = ({ isOpen, onOpen, onOpenChange }: Props) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const { selectTemplate, projectId } = useNinjaEditor();

  const templates = [
    {
      title: "Third Person Metaverse",
      img: "/images/tp1.jpg",
      value: "third_person_metaverse",
    },
  ] as TeplateItemProps[];

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                <div className='flex pr-3'>
                  {t("selectTemplate")}
                  {isLoading && <CircularProgress className='inline pl-4' size='sm' aria-label='Loading...' />}
                </div>
              </ModalHeader>
              <ModalBody>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  {templates.map((item, index) => (
                    <Card
                      shadow='sm'
                      key={index}
                      isPressable
                      onPress={async () => {
                        setIsLoading(true);
                        if (projectId) {
                          // プロジェクトのデータが上書きされます。よろしいですか？
                          MySwal.fire({
                            title: t("overwriteProjectData"),
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: "OK",
                            cancelButtonText: "Cancel",
                          }).then((result) => {
                            if (result.isConfirmed) {
                              selectTemplate(item.value);
                              setTimeout(() => {
                                setIsLoading(false);
                                onClose();
                              }, 3000);
                            } else {
                              setIsLoading(false);
                            }
                          });
                          return;
                        } else {
                          selectTemplate(item.value);
                          setTimeout(() => {
                            setIsLoading(false);
                            onClose();
                          }, 3000);
                        }
                      }}
                    >
                      <CardBody className='overflow-visible p-0'>
                        <Image
                          shadow='sm'
                          radius='lg'
                          width='100%'
                          alt={item.title}
                          className='m-0 h-[200px] w-full object-cover'
                          src={item.img}
                        />
                      </CardBody>
                      <CardFooter className='justify-between text-small'>
                        <b>{item.title}</b>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

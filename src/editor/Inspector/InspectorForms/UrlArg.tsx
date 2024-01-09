import React, { ChangeEvent, useEffect, useState } from "react";

import { Select, SelectItem, Button, RadioGroup, Radio, Spinner } from "@nextui-org/react";
import { OMType } from "@ninjagl/core";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { FaCheck } from "react-icons/fa";
import { useSnapshot } from "valtio";

import { b64EncodeUnicode } from "@/commons/functional";
import { editorStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

type UrlArgType = "url" | "item";

type ItemProps = {
  value: string;
  label: string;
};

const AcceptableFileType = (otype: OMType | undefined): string[] => {
  if (!otype) return [];
  switch (otype) {
    case "ai-npc":
    case "avatar":
    case "object":
      return [".glb", ".gltf"];
    case "audio":
      return [".mp3"];
    case "image":
      return [".png", ".jpg", ".jpeg", ".gif", ".svg", ".bmp", ".tiff", ".webp"];
    case "video":
      return [".mp4"];
    default:
      return [];
  }
};

/**
 * URL指定
 */
export const UrlArg = () => {
  const state = useSnapshot(editorStore);
  const id = state.currentId;
  const editor = useNinjaEditor();
  const { t } = useTranslation();
  const om = editor.getOMById(id);

  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [type, setType] = useState<UrlArgType>("url");
  const [items, setItems] = useState<ItemProps[]>([]);
  const [url, setUrl] = useState<string>("");

  const updateUrl = (e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const validateUrl = async (url: string) => {
    setIsLoading(true);
    // URLがfileとして存在するか確認
    try {
      const response = await fetch(url);
      if (response.status === 200) {
        setIsLoading(false);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const setUrlArgWithValidate = async (_url: string | undefined = undefined) => {
    const checkUrl = _url || url;
    if (checkUrl && om) {
      const val = await validateUrl(checkUrl);
      if (val) {
        editor.setArg(om.id, "url", checkUrl);
      }
    }
  };

  useEffect(() => {
    const getItems = async () => {
      if (isLoading || !session) return;
      setIsLoading(true);
      const prefix = `${b64EncodeUnicode(session.user!.email as string)}/`;
      try {
        const response = await fetch(`/api/storage/all?prefix=${prefix}&limit=1000`);
        const data = await response.json();
        const _items = data.map((item) => {
          return {
            value: item.url,
            label: item.filename,
          };
        });
        const accept = AcceptableFileType(om!.type);
        const filtered = _items.filter((item) => {
          const ext = item.label.split(".").pop();
          return accept.includes(`.${ext}`);
        });
        setItems(filtered);
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    };
    const getValidationItem = async () => {
      const val = await validateUrl(om!.args.url);
      if (val) {
        setUrl(om!.args.url);
      }
    };
    if (type === "url" && om && om.args.url) {
      getValidationItem();
    }
    if (type === "item") {
      getItems();
    }
  }, [type]);

  return (
    <>
      <div>
        {/** セレクト */}
        <RadioGroup
          label='Select Type'
          orientation='horizontal'
          value={type}
          onChange={(e) => {
            setType(e.target.value as UrlArgType);
          }}
        >
          <Radio value='url' aria-label='' aria-labelledby=''>
            {t("url")}
          </Radio>
          <Radio value='item' aria-label='' aria-labelledby=''>
            {t("item")}
          </Radio>
        </RadioGroup>
      </div>
      {type === "url" && (
        <div className='flex'>
          <input
            type='text'
            value={url}
            onChange={updateUrl}
            className='mr-0.5 w-[calc(80%-10px)] rounded-md border-none bg-[#3a3939] px-2.5 py-1.5 text-right text-[#f2f2f2] shadow-lg outline-none'
          />
          <Button
            isIconOnly
            disabled={!url}
            color='warning'
            variant='faded'
            aria-label='check'
            onClick={() => setUrlArgWithValidate()}
          >
            {isLoading ? <Spinner size='sm' /> : <FaCheck />}
          </Button>
        </div>
      )}
      {type === "item" && (
        <Select
          size='sm'
          color='primary'
          className='mt-3'
          items={items}
          startContent={isLoading ? <Spinner size='sm' /> : <></>}
          onChange={(e) => setUrlArgWithValidate(e.target.value)}
        >
          {(item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          )}
        </Select>
      )}
    </>
  );
};

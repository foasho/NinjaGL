"use client";
import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";

export const SearchInput = ({ search }) => {
  const router = useRouter();

  const updateSearch = (formData: FormData) => {
    const search = formData.get("search") as string;
    router.push(`/gallery?search=${search}`);
  };

  return (
    <form action={updateSearch} className='flex'>
      <Input size='sm' type='text' name='search' defaultValue={search} fullWidth placeholder='Search...' />
      <Button type='submit' size='lg' color='primary'>
        Search
      </Button>
    </form>
  );
};

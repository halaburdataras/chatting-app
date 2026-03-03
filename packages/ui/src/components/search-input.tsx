import { useEffect, useState } from "react";
import { Input } from "../components/form";
import useDebounce from "../hooks/use-debounce";
import IconSearch from "../icons/IconSearch";
import { cn } from "@repo/shared/utils";

type SearchInputProps = {
  name: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
};

export default function SearchInput({
  name,
  value,
  onChange,
  className,
  placeholder = "Search...",
}: SearchInputProps) {
  const [search, setSearch] = useState(value);
  const debouncedSearch = useDebounce(search);

  const handleChange = (e: any) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    onChange(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <div className={cn("relative flex items-center", className)}>
      <IconSearch className="pointer-events-none absolute left-3 size-6 min-w-6 text-slate-400" />
      <Input
        name={`search-${name}`}
        type="text"
        placeholder={placeholder}
        className="w-full pl-10"
        value={search}
        onChange={handleChange}
      />
    </div>
  );
}

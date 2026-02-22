import { useEffect, useState } from 'react'
import { Input } from './form'
import useDebounce from '~hooks/use-debounce'
import SearchIcon from '~icons/search.svg'
import { cn } from '@repo/shared/utils'

type SearchInputProps = {
  name: string
  value: string
  onChange: (value: string) => void
  className?: string
}

export default function SearchInput({
  name,
  value,
  onChange,
  className,
}: SearchInputProps) {
  const [search, setSearch] = useState(value)
  const debouncedSearch = useDebounce(search)

  const handleChange = (newValue: string) => {
    setSearch(newValue)
  }

  useEffect(() => {
    onChange(debouncedSearch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  return (
    <div className={cn("relative flex items-center", className)}>
      <SearchIcon className="pointer-events-none absolute left-3 size-6 min-w-6 text-slate-400" />
      <Input
        name={`search-${name}`}
        type="text"
        placeholder="Search..."
        className="w-full pl-10"
        value={search}
        onChange={handleChange}
      />
    </div>
  )
}

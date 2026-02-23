import { Role } from '@repo/database/generated/prisma/enums.js'
import Button from '~components/button'
import SearchInput from '~components/search-input'
import Tag from '~components/tag'
import TrashIcon from '~icons/trash.svg'
import XCircleIcon from '~icons/x-circle.svg'

type FiltersState = {
  search?: string
  role?: Role
}

type FiltersProps = {
  filters: FiltersState
  handleChangeFilters: (filters: FiltersState) => void
  isFiltersApplied: boolean
  handleResetFilters: () => void
}

export default function Filters({
  filters,
  handleChangeFilters,
  isFiltersApplied,
  handleResetFilters,
}: FiltersProps) {
  const handleRemoveFilter = (filter: keyof FiltersState) => {
    handleChangeFilters({ ...filters, [filter]: undefined })
  }

  return (
    <div>
      <div className="p-5">
        <SearchInput
          name="rooms"
          value={filters.search || ''}
          key={filters.search}
          onChange={(value) =>
            handleChangeFilters({ ...filters, search: value })
          }
          className="w-full"
        />
      </div>

      {isFiltersApplied && (
        <div className="flex items-center gap-2 px-5 pb-4">
          {!!filters.search && (
            <FilterItem
              label="Search"
              value={filters.search}
              handleRemoveFilter={() => handleRemoveFilter('search')}
            />
          )}
          <Button
            variant="text-error"
            onClick={handleResetFilters}
            icon={<TrashIcon className="size-5 min-w-5" />}
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  )
}

const FilterItem = ({
  label,
  value,
  handleRemoveFilter,
}: {
  label: string
  value: string
  handleRemoveFilter: () => void
}) => {
  return (
    <span className="flex items-center gap-2 rounded-md border border-dashed border-slate-800/40 p-2 text-sm">
      {label}:{' '}
      <Tag className="flex items-center gap-1">
        {value}{' '}
        <Button variant="text" onClick={handleRemoveFilter}>
          <XCircleIcon className="size-4 min-w-4 text-white" />
        </Button>
      </Tag>
    </span>
  )
}

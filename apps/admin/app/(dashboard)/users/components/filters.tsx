import { Role } from '@repo/database/generated/prisma/enums.js'
import Button from '@repo/ui/components/button'
import SearchInput from '@repo/ui/components/search-input'
import Tag from '~components/tag'
import TrashIcon from '~icons/trash.svg'
import XCircleIcon from '@repo/ui/icons/IconXCircle'
import Dropdown from '@repo/ui/components/dropdown'
import IconChevronDown from '@repo/ui/icons/IconChevronDown'
import { cn } from '@repo/shared/utils'

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
      <div className="grid grid-cols-[auto_1fr] items-center justify-start gap-4 p-5">
        <Dropdown
          trigger={
            <Button
              variant="outline"
              className="h-full min-h-auto min-w-52 justify-between capitalize"
            >
              <span className={cn(filters.role ? 'text-slate-900' : '')}>
                {filters.role
                  ? filters.role.toLowerCase().replaceAll('_', ' ')
                  : 'Role'}
              </span>
              <IconChevronDown className="size-5 min-w-5" />
            </Button>
          }
          list={[
            {
              label: 'User',
              onClick: () =>
                handleChangeFilters({ ...filters, role: Role.USER }),
            },
            {
              label: 'Admin',
              onClick: () =>
                handleChangeFilters({ ...filters, role: Role.ADMIN }),
            },
            {
              label: 'Super Admin',
              onClick: () =>
                handleChangeFilters({ ...filters, role: Role.SUPER_ADMIN }),
            },
          ]}
        />
        <SearchInput
          name="users"
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
          {!!filters.role && (
            <FilterItem
              label="Role"
              value={filters.role.toLowerCase().replaceAll('_', ' ')}
              handleRemoveFilter={() => handleRemoveFilter('role')}
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

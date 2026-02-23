import { cn } from '@repo/shared/utils'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import Button from './button'
import ChevronDownIcon from '~icons/chevron-down.svg'
import Dropdown from './dropdown'

interface TableProps<T extends object> {
  data: T[]
  columns: ColumnDef<T>[]
  footerData?: {
    page: number
    pageSize: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    handleChangeLimit: (pageSize: number) => void
    handleNextPage: () => void
    handlePreviousPage: () => void
  }
  wrapperClassName?: string
  className?: string
}

export default function Table<T extends object>({
  data,
  columns,
  footerData,
  wrapperClassName,
  className,
}: TableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const limitOptions = [
    { label: '5', onClick: () => footerData?.handleChangeLimit(5) },
    { label: '10', onClick: () => footerData?.handleChangeLimit(10) },
    { label: '20', onClick: () => footerData?.handleChangeLimit(20) },
    { label: '50', onClick: () => footerData?.handleChangeLimit(50) },
    { label: '100', onClick: () => footerData?.handleChangeLimit(100) },
  ]

  return (
    <div className={wrapperClassName}>
      <table
        className={cn('w-full table-fixed rounded-lg shadow-md', className)}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-gray-100 text-left">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{ width: `${header.getSize()}px` }}
                  className="h-14 p-4 text-sm font-semibold text-slate-500"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, index) => (
            <tr
              key={row.id}
              className={cn(
                !!index && 'border-t border-dashed border-slate-200'
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-4 text-sm text-slate-900">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {!!footerData && (
          <tfoot>
            <tr>
              <td
                colSpan={columns.length}
                className="border-t border-dashed border-slate-200 px-2 py-3"
              >
                <div className="flex items-center justify-end gap-5">
                  <span className="text-sm text-slate-900">Rows per page:</span>
                  <Dropdown
                    trigger={
                      <Button variant="text" className="group gap-1">
                        {footerData.pageSize}{' '}
                        <ChevronDownIcon className="size-4 min-w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </Button>
                    }
                    list={limitOptions}
                    className="min-w-[70px]"
                  ></Dropdown>
                  <span>
                    {footerData.page} of {footerData.totalPages}
                  </span>
                  <Button
                    variant="icon"
                    disabled={!footerData.hasPreviousPage}
                    aria-label="Previous page"
                    onClick={footerData.handlePreviousPage}
                  >
                    <ChevronDownIcon className="size-6 min-w-6 rotate-90" />
                  </Button>
                  <Button
                    variant="icon"
                    disabled={!footerData.hasNextPage}
                    aria-label="Next page"
                    onClick={footerData.handleNextPage}
                  >
                    <ChevronDownIcon className="size-6 min-w-6 rotate-270" />
                  </Button>
                </div>
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

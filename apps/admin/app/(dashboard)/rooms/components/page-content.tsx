'use client'

import { Role } from '@repo/database/generated/prisma/enums.js'
import { RoomModel } from '@repo/shared'
import { deleteRoom } from '@repo/shared/lib/api'
import { ColumnDef } from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import Button from '@repo/ui/components/button'
import Container from '@repo/ui/components/container'
import Dropdown from '@repo/ui/components/dropdown'
import Skeleton from '@repo/ui/components/skeleton'
import Table from '~components/table'
import IconDotsVertical from '@repo/ui/icons/IconDotsVertical'
import { useToast } from '@repo/ui/providers/toast-provider'
import { useUser } from '@repo/ui/providers/user-provider'
import { ToastType } from '@repo/ui/types/index'
import Filters from './filters'
import PageHero from '~components/page-hero'
import PlusIcon from '~icons/plus.svg'
import usePaginatedRooms from '~hooks/use-paginated-rooms'
import Link from 'next/link'
import Image from 'next/image'

const COL_SKELETONS = [
  {
    header: '',
    accessorKey: 'avatar',
    size: 52,
    cell: () => <Skeleton className="h-9 w-9 shrink-0 rounded-full" />,
  },
  {
    header: 'Name',
    accessorKey: 'name',
    cell: () => <Skeleton className="w-1/2" />,
  },
  {
    header: 'Created By',
    accessorKey: 'createdBy',
    size: 100,
    cell: () => <Skeleton className="w-1/2" />,
  },
  {
    header: 'Created At',
    accessorKey: 'createdAt',
    size: 100,
    cell: () => <Skeleton className="w-1/2" />,
  },
  {
    header: '',
    accessorKey: 'actions',
    size: 68,
    cell: () => (
      <div className="flex justify-end">
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
    ),
  },
]

export default function PageContent() {
  const { user } = useUser()
  const { showToast } = useToast()
  const {
    rooms,
    page,
    pageSize,
    totalPages,
    loading,
    hasNextPage,
    hasPreviousPage,
    filters,
    isFiltersApplied,
    handleChangeLimit,
    handleNextPage,
    handlePreviousPage,
    handleChangeFilters,
    handleResetFilters,
    fetchRooms,
  } = usePaginatedRooms({ limit: 10 })
  const router = useRouter()

  const columns = useMemo(
    (): ColumnDef<RoomModel>[] => [
      {
        header: '',
        accessorKey: 'avatar',
        size: 52,
        cell: ({ row }) => (
          <Image
            src={row.original.avatar ?? '/images/room-empty-avatar.svg'}
            alt="Avatar"
            className="h-9 w-9 shrink-0 rounded-full object-cover"
            width={36}
            height={36}
          />
        ),
      },
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }) => (
          <div className="flex">
            {' '}
            <span className="min-w-0 flex-1 truncate">{row.original.name}</span>
          </div>
        ),
      },
      {
        header: 'Created By',
        accessorKey: 'createdBy',
        size: 100,
        cell: ({ row }) => (
          <div className="flex">
            <Link
              href={`/users?username=${row.original.user.username}`}
              className="min-w-0 flex-1 truncate font-medium text-slate-900 underline transition-colors duration-200 hover:text-slate-900/70"
            >
              {row.original.user.username}
            </Link>
          </div>
        ),
      },
      {
        header: 'Created At',
        accessorKey: 'createdAt',
        size: 100,
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString(),
      },
      {
        header: '',
        accessorKey: 'actions',
        size: 68,
        cell: ({ row }) => {
          const handleEdit = () => {
            if (
              user?.role !== Role.SUPER_ADMIN &&
              row.original.userId !== user?.id
            ) {
              showToast(
                'You are not allowed to edit this room',
                ToastType.ERROR
              )
              return
            }

            router.push(`/rooms/edit/${row.original.id}`)
          }

          const handleDelete = async () => {
            if (
              user?.role !== Role.SUPER_ADMIN &&
              row.original.userId !== user?.id
            ) {
              showToast(
                'You are not allowed to delete this room',
                ToastType.ERROR
              )
              return
            }

            try {
              const response = await deleteRoom({ id: row.original.id })
              if (response.success) {
                showToast('Room deleted successfully', ToastType.SUCCESS)
                await fetchRooms()
              } else {
                showToast(
                  response.error || 'Failed to delete room',
                  ToastType.ERROR
                )
              }
            } catch (error) {
              console.error(error)
              showToast('Failed to delete room', ToastType.ERROR)
            }
          }

          return (
            <div className="flex justify-end">
              <Dropdown
                align="end"
                className="min-w-32"
                trigger={
                  <Button variant="icon">
                    <IconDotsVertical className="size-5 min-w-5" />
                  </Button>
                }
                list={[
                  {
                    label: 'Edit',
                    onClick: handleEdit,
                  },
                  {
                    label: 'Export messages to CSV',
                    onClick: () => {
                      console.log('TODO: Export messages to CSV')
                    },
                  },
                  {
                    label: 'Delete',
                    onClick: handleDelete,
                    variant: 'error',
                  },
                ]}
              ></Dropdown>
            </div>
          )
        },
      },
    ],
    [user, router, showToast, fetchRooms]
  )

  return (
    <Container as="main" className="py-10">
      <PageHero
        title="Rooms"
        description="Manage your rooms"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Rooms', href: '/rooms' },
        ]}
        actions={[
          {
            label: 'Add Room',
            icon: <PlusIcon className="size-5 min-w-5" />,
            href: '/rooms/add',
          },
        ]}
      />

      <div className="shadow-card mt-10 overflow-hidden">
        <Filters
          filters={filters}
          handleChangeFilters={handleChangeFilters}
          isFiltersApplied={isFiltersApplied}
          handleResetFilters={handleResetFilters}
        />

        <Table
          data={
            loading
              ? (Array.from({ length: pageSize }).map((_, index) => ({
                  id: index.toString(),
                })) as RoomModel[])
              : rooms
          }
          columns={loading ? COL_SKELETONS : columns}
          footerData={{
            page,
            pageSize,
            totalPages,
            hasNextPage,
            hasPreviousPage,
            handleChangeLimit,
            handleNextPage,
            handlePreviousPage,
          }}
          wrapperClassName="w-full"
          className="rounded-none shadow-none"
        />
      </div>
    </Container>
  )
}

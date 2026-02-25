'use client'

import { Role } from '@repo/database/generated/prisma/enums.js'
import { UserModel } from '@repo/shared'
import { deleteUser } from '@repo/shared/lib/api'
import { ColumnDef } from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import Button from '@repo/ui/components/button'
import Container from '@repo/ui/components/container'
import Dropdown from '@repo/ui/components/dropdown'
import Skeleton from '@repo/ui/components/skeleton'
import Table from '~components/table'
import Tag from '~components/tag'
import usePaginatedUsers from '~hooks/use-paginated-users'
import DotsVerticalIcon from '~icons/dots-vertical.svg'
import { useToast } from '@repo/ui/providers/toast-provider'
import { useUser } from '@repo/ui/providers/user-provider'
import { ToastType } from '@repo/ui/types/index'
import Filters from './filters'
import PageHero from '~components/page-hero'
import PlusIcon from '~icons/plus.svg'

const TAG_COLORS: Record<Role, 'info' | 'warning' | 'error'> = {
  [Role.USER]: 'info',
  [Role.ADMIN]: 'warning',
  [Role.SUPER_ADMIN]: 'error',
}

const COL_SKELETONS = [
  {
    header: 'Username',
    accessorKey: 'username',
    cell: () => <Skeleton className="w-1/2" />,
  },
  {
    header: 'Email',
    accessorKey: 'email',
    cell: () => <Skeleton className="w-1/2" />,
  },
  {
    header: 'Role',
    accessorKey: 'role',
    size: 100,
    cell: () => <Skeleton className="h-6 w-1/2 rounded-md bg-blue-300" />,
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

interface PageContentProps {
  username?: string
}

export default function PageContent({ username }: PageContentProps) {
  const { user } = useUser()
  const { showToast } = useToast()
  const {
    users,
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
    fetchUsers,
  } = usePaginatedUsers({ limit: 10, initialFilters: { search: username } })
  const router = useRouter()

  const columns = useMemo(
    (): ColumnDef<UserModel>[] => [
      {
        header: 'Username',
        accessorKey: 'username',
        cell: ({ row }) => (
          <div className="flex">
            {' '}
            <span className="min-w-0 flex-1 truncate">
              {row.original.username}
            </span>
          </div>
        ),
      },
      {
        header: 'Email',
        accessorKey: 'email',
        cell: ({ row }) => (
          <div className="flex">
            {' '}
            <span className="min-w-0 flex-1 truncate">
              {row.original.email}
            </span>
          </div>
        ),
      },
      {
        header: 'Role',
        accessorKey: 'role',
        size: 100,
        cell: ({ row }) => (
          <Tag variant={TAG_COLORS[row.original.role]} className="capitalize">
            {row.original.role.toLowerCase().replaceAll('_', ' ')}
          </Tag>
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
          const isCurrentUser = row.original.id === user?.id

          const handleEdit = () => {
            if (
              row.original.role === Role.SUPER_ADMIN &&
              user?.role !== Role.SUPER_ADMIN
            ) {
              showToast(
                'Only super admins can edit super admin accounts',
                ToastType.ERROR
              )
              return
            }

            router.push(`/users/edit/${row.original.id}`)
          }

          const handleDelete = async () => {
            if (user?.role !== Role.SUPER_ADMIN) {
              showToast('Only super admins can delete users', ToastType.ERROR)
              return
            }
            if (isCurrentUser) {
              showToast('You cannot delete your own account', ToastType.ERROR)
              return
            }

            try {
              const response = await deleteUser({ id: row.original.id })
              if (response.success) {
                showToast('User deleted successfully', ToastType.SUCCESS)
                await fetchUsers()
              } else {
                showToast(
                  response.error || 'Failed to delete user',
                  ToastType.ERROR
                )
              }
            } catch (error) {
              console.error(error)
              showToast('Failed to delete user', ToastType.ERROR)
            }
          }

          return (
            <div className="flex justify-end">
              <Dropdown
                align="end"
                className="min-w-32"
                trigger={
                  <Button variant="icon">
                    <DotsVerticalIcon className="size-5 min-w-5" />
                  </Button>
                }
                list={[
                  {
                    label: 'Edit',
                    onClick: handleEdit,
                  },
                  {
                    label: 'Delete',
                    onClick: handleDelete,
                    variant: 'error',
                    disabled: isCurrentUser,
                  },
                ]}
              ></Dropdown>
            </div>
          )
        },
      },
    ],
    [user, router, showToast, fetchUsers]
  )

  return (
    <Container as="main" className="py-10">
      <PageHero
        title="Users"
        description="Manage your users"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Users', href: '/users' },
        ]}
        actions={[
          {
            label: 'Add User',
            icon: <PlusIcon className="size-5 min-w-5" />,
            href: '/users/add',
          },
        ]}
      />

      <div className="mt-10 overflow-hidden rounded-lg shadow-[0_0_2px_0_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.12)]">
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
                })) as UserModel[])
              : users
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

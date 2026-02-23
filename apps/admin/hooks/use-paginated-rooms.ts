'use client'

import { RoomModel } from '@repo/shared'
import { getPaginatedRooms } from '@repo/shared/lib/api'
import { useEffect, useState, useCallback, useMemo } from 'react'

interface UsePaginatedRoomsProps {
  limit?: number
}

export default function usePaginatedRooms({
  limit = 10,
}: UsePaginatedRoomsProps) {
  const [rooms, setRooms] = useState<RoomModel[]>([])
  const [total, setTotal] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(limit)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [filters, setFilters] = useState<{
    search?: string
  }>({})

  const fetchRooms = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getPaginatedRooms({
        page,
        pageSize,
        search: filters.search,
      })

      if (response.success && response.data) {
        setRooms(response.data.items)
        setTotalPages(response.data.totalPages)
        if (!total) {
          setTotal(response.data.total)
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filters])

  const handleChangeLimit = useCallback((newLimit: number) => {
    setPageSize(newLimit)
    setPage(1)
  }, [])

  const handleChangeFilters = useCallback((newFilters: { search?: string }) => {
    setFilters(newFilters)
    setPage(1)
  }, [])

  const handleResetFilters = useCallback(() => {
    setFilters({})
    setPage(1)
  }, [])

  const hasNextPage = useMemo(() => {
    return page * pageSize < total
  }, [page, pageSize, total])

  const hasPreviousPage = useMemo(() => {
    return page > 1
  }, [page])

  const isFiltersApplied = useMemo(() => {
    return Object.values(filters).some(
      (value) => value !== undefined && value !== ''
    )
  }, [filters])

  const handleNextPage = useCallback(() => {
    setPage((prev) => prev + 1)
  }, [])

  const handlePreviousPage = useCallback(() => {
    setPage((prev) => prev - 1)
  }, [])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  return {
    rooms,
    total,
    page,
    pageSize,
    loading,
    hasNextPage,
    hasPreviousPage,
    totalPages,
    filters,
    isFiltersApplied,
    handleChangeFilters,
    handleResetFilters,
    handleChangeLimit,
    handleNextPage,
    handlePreviousPage,
    fetchRooms,
  }
}

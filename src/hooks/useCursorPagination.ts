import { useCallback, useState } from 'react'

interface UseCursorPaginationOptions {
  initialPageSize?: number
}

export function useCursorPagination({ initialPageSize = 10 }: UseCursorPaginationOptions = {}) {
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [cursor, setCursor] = useState<string | undefined>()
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([])

  const pageIndex = cursorStack.length
  const hasPrev = cursorStack.length > 0

  const resetPagination = useCallback(() => {
    setCursor(undefined)
    setCursorStack([])
  }, [])

  const goNext = useCallback((nextCursor: string | null | undefined) => {
    if (!nextCursor) return
    setCursorStack((prev) => [...prev, cursor ?? null])
    setCursor(nextCursor)
  }, [cursor])

  const goPrev = useCallback(() => {
    setCursorStack((prevStack) => {
      if (prevStack.length === 0) return prevStack
      const prev = prevStack[prevStack.length - 1]
      setCursor(prev ?? undefined)
      return prevStack.slice(0, -1)
    })
  }, [])

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    resetPagination()
  }, [resetPagination])

  return {
    pageSize,
    cursor,
    pageIndex,
    hasPrev,
    resetPagination,
    goNext,
    goPrev,
    handlePageSizeChange,
  }
}

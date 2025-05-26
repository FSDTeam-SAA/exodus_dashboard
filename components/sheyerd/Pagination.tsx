"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

interface ReusablePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  maxVisiblePages?: number
}

export function ReusablePagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
}: ReusablePaginationProps) {
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const half = Math.floor(maxVisiblePages / 2)
    let start = Math.max(currentPage - half, 1)
    const end = Math.min(start + maxVisiblePages - 1, totalPages)

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(end - maxVisiblePages + 1, 1)
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const visiblePages = getVisiblePages()
  const showStartEllipsis = visiblePages[0] > 2
  const showEndEllipsis = visiblePages[visiblePages.length - 1] < totalPages - 1

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 p-0 border-[#C0A05C] dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-800"
      >
        <ChevronLeft className="h-4 w-4 text-white" />
      </Button>

      {visiblePages[0] > 1 && (
        <>
          <Button
            variant={currentPage === 1 ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(1)}
            className={`h-8 w-8 p-0 ${currentPage === 1
              ? "bg-[#C0A05C] hover:bg-[#C0A05C]/80 text-white"
              : "border-[#C0A05C] dark:border-[#C0A05C]/80 hover:bg-amber-100 dark:hover:bg-amber-800"
              }`}
          >
            1
          </Button>
          {showStartEllipsis && (
            <div className="flex items-center justify-center h-8 w-8">
              <MoreHorizontal className="h-4 w-4 text-[#C0A05C] dark:text-amber-400" />
            </div>
          )}
        </>
      )}

      {visiblePages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(page)}
          className={`h-8 w-8 p-0 ${currentPage === page
            ? "bg-[#C0A05C] hover:bg-[#C0A05C]/80 text-white"
            : "border-[#C0A05C] dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-800"
            }`}
        >
          {page}
        </Button>
      ))}

      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {showEndEllipsis && (
            <div className="flex items-center justify-center h-8 w-8">
              <MoreHorizontal className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          )}
          <Button
            variant={currentPage === totalPages ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(totalPages)}
            className={`h-8 w-8 p-0 ${currentPage === totalPages
              ? "bg-amber-600 hover:bg-amber-700 text-white"
              : "border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-800"
              }`}
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 p-0 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-800"
      >
        <ChevronRight className="h-4 w-4 text-white" />
      </Button>
    </div>
  )
}

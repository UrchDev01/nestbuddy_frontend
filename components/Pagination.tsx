"use client";

import { useMemo } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
    isLoading?: boolean;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    className = "",
    isLoading = false,
}: PaginationProps) {
    const pages = useMemo<(number | "...")[]>(() => {
        if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);
        const start = Math.max(2, Math.min(currentPage - 1, totalPages - 3));
        const end = Math.min(totalPages - 1, start + 2);
        return [
            1,
            ...(start > 2 ? ["..." as const] : []),
            ...Array.from({ length: end - start + 1 }, (_, index) => start + index),
            ...(end < totalPages - 1 ? ["..." as const] : []),
            totalPages,
        ];
    }, [currentPage, totalPages]);

    if (totalPages <= 1) return null;
    const buttonClass = "inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2";

    return (
        <div className={`flex flex-wrap items-center justify-center gap-1.5 ${className}`}>
            <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                aria-label="Go to previous page"
                className={`${buttonClass} border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40`}
            >
                <FiChevronLeft aria-hidden="true" size={18} />
                <span className="sr-only">Previous</span>
            </button>
            {pages.map((page, index) => page === "..." ? (
                <span key={`ellipsis-${index}`} aria-hidden="true" className="px-1 text-slate-400">…</span>
            ) : (
                <button
                    key={page}
                    type="button"
                    onClick={() => onPageChange(page)}
                    disabled={isLoading}
                    aria-label={`Go to page ${page}`}
                    aria-current={page === currentPage ? "page" : undefined}
                    className={`${buttonClass} ${page === currentPage
                        ? "border-indigo-600 bg-indigo-600 text-white-1"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                    {page}
                </button>
            ))}
            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
                aria-label="Go to next page"
                className={`${buttonClass} border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40`}
            >
                <FiChevronRight aria-hidden="true" size={18} />
                <span className="sr-only">Next</span>
            </button>
        </div>
    );
}

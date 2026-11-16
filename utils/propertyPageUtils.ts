import type { KeyboardEvent as ReactKeyboardEvent } from "react";

export interface PropertyPageList<T> {
    results: T[];
    totalCount: number;
    hasMore: boolean;
    nextPage: number | null;
}

export function trapDialogTab(event: ReactKeyboardEvent<HTMLElement>): void {
    if (event.key !== "Tab") return;
    const dialog = event.currentTarget;
    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ));
    if (focusable.length === 0) {
        event.preventDefault();
        return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
    }
}

function asRecord(value: unknown): Record<string, unknown> | null {
    return typeof value === "object" && value !== null
        ? value as Record<string, unknown>
        : null;
}

export function readPropertyPage<T>(response: unknown): PropertyPageList<T> | null {
    let current: unknown = response;

    for (let depth = 0; depth < 4; depth += 1) {
        const record = asRecord(current);
        if (!record) return null;

        if (Array.isArray(record.results)) {
            let nextPage = typeof record.next_page === "number" ? record.next_page : null;
            if (nextPage === null && typeof record.next === "string") {
                try {
                    const nextUrl = new URL(record.next, "http://localhost");
                    const parsedPage = Number(nextUrl.searchParams.get("page"));
                    if (Number.isInteger(parsedPage) && parsedPage > 0) nextPage = parsedPage;
                } catch {
                    nextPage = null;
                }
            }
            return {
                results: record.results as T[],
                totalCount: typeof record.total_count === "number"
                    ? record.total_count
                    : typeof record.count === "number" ? record.count : record.results.length,
                hasMore: record.has_more === true || Boolean(record.next),
                nextPage,
            };
        }

        current = record.data;
    }

    return null;
}

export function getPropertyActionError(error: unknown, fallback: string): string {
    if (!(error instanceof Error)) return fallback;
    const message = error.message.trim();
    if (
        !message ||
        message.length > 180 ||
        /axioserror|network error|http error|internal server error|status:\s*\d|^\s*[{[]/i.test(message)
    ) {
        return fallback;
    }
    return message;
}

export function propertyImageUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    return baseUrl ? `${baseUrl}${path.startsWith("/") ? path : `/${path}`}` : path;
}

export function getApiPage(response: unknown): PropertyPageList<unknown> | null {
    return readPropertyPage<unknown>(response);
}

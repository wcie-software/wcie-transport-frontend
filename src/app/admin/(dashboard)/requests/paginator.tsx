import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

export function Paginator({ page, hasMorePages, onPageMoved }:
    { page: number, hasMorePages: boolean, onPageMoved: (right: boolean) => void }
) {
    return (
        <div className="flex flex-row items-center gap-4">
            <button
                className="p-2 rounded-full hover:bg-tertiary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                disabled={page === 0}
                onClick={() => onPageMoved(false)}
            >
                <ChevronLeftIcon width={24} height={24} />
            </button>
            <span className="font-medium">{page + 1}</span>
            <button
                className="p-2 rounded-full hover:bg-tertiary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                disabled={!hasMorePages}
                onClick={() => onPageMoved(true)}
            >
                <ChevronRightIcon width={24} height={24} />
            </button>
        </div>
    );
}
"use client";

import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store"; // Adjust path to your Redux root state
import { setPageNo } from "@/redux/slice/books.slice";



const Pagination = ({  }) => {
  const totalBooks = useSelector((state: RootState) => state.catalogue.totalBooks);
  const currentPage = useSelector((state: RootState) => state.catalogue.page_no);
  const pageSize = useSelector((state: RootState) => state.catalogue.pageSize);
  const resultQuery = useSelector((state: RootState) => state.catalogue.result_query);
  const searchType = useSelector((state: RootState) => state.catalogue.result_type);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalBooks / pageSize)),
    [totalBooks, pageSize]
  );

  const dispatch = useDispatch()

  const onPageChange = (pageNo:any)=>{
    dispatch(setPageNo({page_no : pageNo}))
  }

  if(!totalBooks) return

  return (
    <>
      {/*  Display current search context */}
      <div className=" text-center text-sm text-muted-foreground h-10 w-full">
        {totalBooks > 0 && (
          <p className="truncate">
            Result for "<span className="font-semibold text-primary">{searchType}</span>": "{resultQuery}"
          </p>
        )}
      </div>

      {/* Results Header - Clean Design */}
      {totalBooks && <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 mt-4">
        {/* Results Info */}
        <div className="space-y-0.5">
          <h3 className="text-sm font-medium text-foreground">
            {totalBooks} {totalBooks === 1 ? "result" : "results"}
          </h3>
          <p className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalBooks)} of {totalBooks} entries
          </p>
        </div>

        {/* Page Info */}
        <div className="text-xs text-muted-foreground">
          Page <span className="font-semibold text-foreground">{currentPage}</span> of <span className="font-semibold text-foreground">{totalPages}</span>
        </div>
      </div>}

      {/* Pagination - All Pages Visible */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-1 border-b border-border pb-6">
          {/* Previous Button */}
          <button
            onClick={() => {
              if (currentPage > 1) {
                onPageChange(currentPage - 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            disabled={currentPage === 1}
            className="h-8 px-3 text-sm rounded-md border border-border bg-card text-foreground/70 hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {/* Page Numbers with Ellipsis */}
          <div className="flex items-center gap-1">
            {(() => {
              const pages: (number | string)[] = [];
              const maxVisible = 5;
              const sidePages = 2;

              if (totalPages <= maxVisible) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);

                let start = Math.max(2, currentPage - sidePages);
                let end = Math.min(totalPages - 1, currentPage + sidePages);

                if (start > 2) pages.push("...");

                for (let i = start; i <= end; i++) pages.push(i);

                if (end < totalPages - 1) pages.push("...");

                pages.push(totalPages);
              }

              return pages.map((pageNum, index) => (
                <React.Fragment key={index}>
                  {pageNum === "..." ? (
                    <span className="px-2 text-muted-foreground">...</span>
                  ) : (
                    <button
                      onClick={() => {
                        onPageChange(pageNum as number);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`min-w-[32px] h-8 px-2 text-sm rounded-md transition-all ${
                        currentPage === pageNum
                          ? "bg-primary text-primary-foreground font-medium shadow-sm"
                          : "text-foreground/70 hover:bg-muted"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )}
                </React.Fragment>
              ));
            })()}
          </div>

          {/* Next Button */}
          <button
            onClick={() => {
              if (currentPage < totalPages) {
                onPageChange(currentPage + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            disabled={currentPage === totalPages}
            className="h-8 px-3 text-sm rounded-md border border-border bg-card text-foreground/70 hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
};

export default Pagination;
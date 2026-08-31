"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CellInfo<TData> {
  getValue: () => any;
  row: any;
}

interface Column<TData> {
  accessorKey: keyof TData | string;
  header: string;
  cell?: (row: any, info: CellInfo<TData>) => React.ReactNode;
  id?: string;
}

interface DataTableProps<TData> {
  columns: Column<TData>[];
  data: TData[];
  searchKey?: string;
  filterColumns?: string[];
  pageSize?: number;
  className?: string;
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData extends Record<string, unknown>>({
  columns,
  data,
  searchKey,
  filterColumns,
  pageSize = 10,
  className,
  onRowClick,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pageIndex, setPageIndex] = React.useState(0);

  const filteredData = React.useMemo(() => {
    let result = data;

    if (globalFilter) {
      const search = globalFilter.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) =>
          String(row[col.accessorKey] as string).toLowerCase().includes(search)
        )
      );
    }

    if (sorting) {
      result = [...result].sort((a, b) => {
        const aVal = String(a[sorting.key] as string);
        const bVal = String(b[sorting.key] as string);
        const dir = sorting.direction === "asc" ? 1 : -1;
        return aVal.localeCompare(bVal) * dir;
      });
    }

    return result;
  }, [data, globalFilter, sorting, columns]);

  const paginatedData = React.useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pageIndex, pageSize]);

  const handleSort = (key: string) => {
    setSorting((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const pageCount = Math.ceil(filteredData.length / pageSize);

  const getCellValue = (row: TData, column: Column<TData>) => {
    if (column.cell) {
      const info: CellInfo<TData> = {
        getValue: () => row[column.accessorKey as string],
        row,
      };
      return column.cell(row, info);
    }
    return String(row[column.accessorKey as string] ?? "");
  };

  return (
    <div className={cn("space-y-4", className)}>
      {(searchKey || filterColumns) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {searchKey && (
            <Input
              placeholder={`Search ${searchKey}...`}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="max-w-sm"
            />
          )}
          {filterColumns && filterColumns.length > 0 && (
            <Select value={filterColumns[0]} onValueChange={() => {}}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                {filterColumns.map((col) => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      <div className="rounded-md border overflow-hidden">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.accessorKey)}
                  className={cn(
                    "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
                    column.cell === undefined && "cursor-pointer select-none hover:bg-muted"
                  )}
                  onClick={() => !column.cell && handleSort(String(column.accessorKey))}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.cell === undefined && (
                      <span className="hidden lg:inline-flex">
                        {sorting?.key === String(column.accessorKey) ? (
                          sorting.direction === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No data available
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn(
                    "border-b transition-colors",
                    onRowClick && "cursor-pointer hover:bg-muted/50"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td key={String(column.accessorKey)} className="p-4 align-middle">
                      {getCellValue(row, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {pageIndex * pageSize + 1} to{" "}
          {Math.min((pageIndex + 1) * pageSize, filteredData.length)}{" "}
          of {filteredData.length} results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            disabled={pageIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
            disabled={pageIndex >= pageCount - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
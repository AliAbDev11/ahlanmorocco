import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { TableHead } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export type SortDirection = 'asc' | 'desc' | null;

interface SortableTableHeadProps {
  column: string;
  label: string;
  sortColumn: string | null;
  sortDirection: SortDirection;
  onSort: (column: string) => void;
  className?: string;
}

const SortableTableHead = ({
  column,
  label,
  sortColumn,
  sortDirection,
  onSort,
  className
}: SortableTableHeadProps) => {
  const isActive = sortColumn === column;

  return (
    <TableHead
      onClick={() => onSort(column)}
      className={cn(
        'cursor-pointer select-none hover:bg-muted/50 transition-colors',
        isActive && 'bg-muted/30',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span>{label}</span>
        <div className="flex-shrink-0">
          {isActive ? (
            sortDirection === 'asc' ? (
              <ArrowUp className="w-4 h-4 text-primary" />
            ) : (
              <ArrowDown className="w-4 h-4 text-primary" />
            )
          ) : (
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>
    </TableHead>
  );
};

export default SortableTableHead;

// Helper hook for sorting logic
export function useSorting<T>(
  data: T[],
  defaultColumn: string | null = null,
  defaultDirection: SortDirection = 'asc'
) {
  const [sortColumn, setSortColumn] = useState<string | null>(defaultColumn);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultDirection);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;

    let aVal = (a as any)[sortColumn];
    let bVal = (b as any)[sortColumn];

    // Handle null/undefined
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return sortDirection === 'asc' ? 1 : -1;
    if (bVal == null) return sortDirection === 'asc' ? -1 : 1;

    // Handle different data types
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    // Handle dates
    if (aVal instanceof Date && bVal instanceof Date) {
      aVal = aVal.getTime();
      bVal = bVal.getTime();
    }

    // Handle date strings
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      const aDate = Date.parse(aVal);
      const bDate = Date.parse(bVal);
      if (!isNaN(aDate) && !isNaN(bDate) && aVal.includes('-')) {
        aVal = aDate;
        bVal = bDate;
      }
    }

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });

  return {
    sortColumn,
    sortDirection,
    handleSort,
    sortedData
  };
}

// Custom urgency sorter
export const sortByUrgency = (urgency: string): number => {
  const order: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3
  };
  return order[urgency] ?? 4;
};

import { useState } from 'react';

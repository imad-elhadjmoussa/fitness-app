import type { StreakRow } from "@/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "cn"

interface StreakTableProps {
  rows: StreakRow[]
  highlightUserId?: string
}

export function StreakTable({ rows, highlightUserId }: StreakTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rank</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Current</TableHead>
          <TableHead>Longest</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, i) => {
          const highlighted = row.userId === highlightUserId
          return (
            <TableRow
              key={row.userId}
              className={cn(highlighted && "bg-primary/10 hover:bg-primary/15")}
              data-state={highlighted ? "selected" : undefined}
            >
              <TableCell>{i + 1}</TableCell>
              <TableCell className="font-medium">
                {row.name}
                {highlighted ? (
                  <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                ) : null}
              </TableCell>
              <TableCell>{row.current}</TableCell>
              <TableCell>{row.longest}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

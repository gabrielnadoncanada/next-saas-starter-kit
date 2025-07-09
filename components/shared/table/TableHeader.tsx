import { TableHead, TableRow } from '@/lib/components/ui/table';

export const TableHeader = ({ cols }: { cols: string[] }) => {
  return (
    <TableRow>
      {cols.map((col, index) => (
        <TableHead key={index}>{col}</TableHead>
      ))}
    </TableRow>
  );
};

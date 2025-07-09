import {
  Table as ShadcnTable,
  TableBody as ShadcnTableBody,
  TableHeader as ShadcnTableHeader,
} from '@/lib/components/ui/table';
import { TableHeader } from './TableHeader';
import { TableBody, TableBodyType } from './TableBody';

export const Table = ({
  cols,
  body,
  noMoreResults,
}: {
  cols: string[];
  body: TableBodyType[];
  noMoreResults?: boolean;
}) => {
  return (
    <ShadcnTable>
      <ShadcnTableHeader>
        <TableHeader cols={cols} />
      </ShadcnTableHeader>
      <ShadcnTableBody>
        <TableBody cols={cols} body={body} noMoreResults={noMoreResults} />
      </ShadcnTableBody>
    </ShadcnTable>
  );
};

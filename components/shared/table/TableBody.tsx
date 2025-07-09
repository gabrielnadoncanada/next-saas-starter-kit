import { TableCell, TableRow } from '@/lib/components/ui/table';
import { Button } from '@/lib/components/ui/button';
import { Badge } from '@/lib/components/ui/badge';
import { useTranslations } from 'next-intl';

interface TableBodyCell {
  wrap?: boolean;
  text?: string;
  minWidth?: number;
  buttons?: {
    text: string;
    color?: string;
    onClick: () => void;
  }[];
  badge?: {
    text: string;
    color: string;
  };
  element?: React.JSX.Element;
  actions?: {
    text: string;
    icon: React.JSX.Element;
    onClick: () => void;
    destructive?: boolean;
  }[];
}

export interface TableBodyType {
  id: string;
  cells: TableBodyCell[];
}

export const TableBody = ({
  cols,
  body,
  noMoreResults,
}: {
  cols: string[];
  body: TableBodyType[];
  noMoreResults?: boolean;
}) => {
  const t = useTranslations();

  if (noMoreResults) {
    return (
      <TableRow>
        <TableCell
          colSpan={cols.length}
          className="text-center text-muted-foreground"
        >
          {t('no-more-results')}
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {body.map((row) => {
        return (
          <TableRow key={row.id}>
            {row.cells?.map((cell: any, index: number) => {
              return (
                <TableCell
                  key={row.id + '-td-' + index}
                  className={cell.wrap ? 'break-all' : 'whitespace-nowrap'}
                  style={
                    cell.minWidth ? { minWidth: `${cell.minWidth}px` } : {}
                  }
                >
                  {!cell.buttons || cell.buttons?.length === 0 ? null : (
                    <div className="flex space-x-2">
                      {cell.buttons?.map((button: any, index: number) => {
                        return (
                          <Button
                            key={row.id + '-button-' + index}
                            size="sm"
                            variant="outline"
                            onClick={button.onClick}
                          >
                            {button.text}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                  {!cell.actions || cell.actions?.length === 0 ? null : (
                    <span className="flex gap-3">
                      {cell.actions?.map((action: any, index: number) => {
                        return (
                          <div
                            key={row.id + '-diva-' + index}
                            className="tooltip"
                            data-tip={action.text}
                          >
                            <button
                              key={row.id + '-action-' + index}
                              className={`py-2 ${action.destructive ? 'text-red-500 hover:text-red-900' : 'hover:text-green-400'}`}
                              onClick={action.onClick}
                            >
                              {action.icon}
                            </button>
                          </div>
                        );
                      })}
                    </span>
                  )}
                  {cell.badge ? (
                    <Badge
                      variant={
                        cell.badge.color === 'error' ? 'destructive' : 'default'
                      }
                    >
                      {cell.badge.text}
                    </Badge>
                  ) : null}
                  {cell.text ? cell.text : null}
                  {cell.element ? cell.element : null}
                </TableCell>
              );
            })}
          </TableRow>
        );
      })}
    </>
  );
};

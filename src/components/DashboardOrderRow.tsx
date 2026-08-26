import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { DashboardResponse } from '../types/dashboard';

interface DashboardOrderRowProps {
  order: DashboardResponse['orders'][number];
  expanded: boolean;
  onToggle: () => void;
}

export function DashboardOrderRow({ order, expanded, onToggle }: DashboardOrderRowProps) {
  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton
            size="small"
            onClick={onToggle}
            sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </TableCell>
        <TableCell>{order.client.name}</TableCell>
        <TableCell>{order.product.name}</TableCell>
        <TableCell align="right">{order.quantity}</TableCell>
        <TableCell align="right">{order.remaining}</TableCell>
        <TableCell align="right">{order.totals.completed}</TableCell>
        <TableCell align="right">{order.totals.needsRework}</TableCell>
        <TableCell align="right">{order.totals.partiallyAssembled}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={8} sx={{ py: 0, borderBottom: expanded ? undefined : 'none' }}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Щоденний прогрес
            </Typography>
            <Table size="small" sx={{ mb: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Дата</TableCell>
                  <TableCell>Робітник</TableCell>
                  <TableCell align="right">Готово</TableCell>
                  <TableCell align="right">Потребує виправлення</TableCell>
                  <TableCell align="right">Не допаяно</TableCell>
                  <TableCell>Нотатки</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                    <TableCell>{entry.employee.name}</TableCell>
                    <TableCell align="right">{entry.completed}</TableCell>
                    <TableCell align="right">{entry.needsRework}</TableCell>
                    <TableCell align="right">{entry.partiallyAssembled}</TableCell>
                    <TableCell>{entry.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

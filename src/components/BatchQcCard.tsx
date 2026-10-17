import FactCheckIcon from '@mui/icons-material/FactCheckOutlined';
import { Paper, Stack, Typography } from '@mui/material';

// Quality control (AOI). For now only a placeholder: a photo and verdict per board come later.
export function BatchQcCard({ active }: { active: boolean }) {
  return (
    <Paper sx={{ p: 2.5, ...(active && { borderColor: 'primary.light', borderWidth: 2 }) }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <FactCheckIcon color={active ? 'primary' : 'disabled'} />
        <Stack spacing={0.5}>
          <Typography variant="h6">Контроль якості (AOI)</Typography>
          <Typography variant="body2" color="text.secondary">
            Незабаром тут буде фото кожної плати з AOI та результат перевірки по кожній. Поки що додайте фото у «Файли партії», а
            підсумок перевірки — коментарем при переході на «Відвантаження».
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}

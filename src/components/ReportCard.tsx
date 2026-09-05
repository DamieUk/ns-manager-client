import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { Card, CardActionArea, CardContent, Stack, Typography } from '@mui/material';
import type { DailyProgress } from '../types/dailyProgress';

interface ReportCardProps {
  entry: DailyProgress;
  onClick: () => void;
}

export function ReportCard({ entry, onClick }: ReportCardProps) {
  return (
    <Card sx={{ width: 220 }}>
      <CardActionArea onClick={onClick}>
        <CardContent>
          <Typography variant="caption" color="text.secondary">
            {new Date(entry.date).toLocaleDateString()}
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }} noWrap>
            {entry.order.client.name} — {entry.order.product.name}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Готово
              </Typography>
              <Typography variant="h6">{entry.completed}</Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Виправити
              </Typography>
              <Typography variant="h6" color={entry.needsRework > 0 ? 'error' : 'inherit'}>
                {entry.needsRework}
              </Typography>
            </Stack>
            {entry.photo && (
              <Stack sx={{ ml: 'auto', justifyContent: 'flex-end' }}>
                <PhotoCameraIcon fontSize="small" color="action" />
              </Stack>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

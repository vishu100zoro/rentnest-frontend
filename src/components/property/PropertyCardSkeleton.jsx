import { Card, CardContent, Skeleton, Box } from '@mui/material';

export default function PropertyCardSkeleton() {
  return (
    <Card sx={{ height: '100%' }}>
      <Skeleton variant="rectangular" height={210} />
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Skeleton width={80} height={22} />
          <Skeleton width={70} height={22} />
        </Box>
        <Skeleton width="80%" height={28} sx={{ mb: 0.5 }} />
        <Skeleton width="95%" height={18} sx={{ mb: 1.5 }} />
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Skeleton width={70} height={24} />
          <Skeleton width={70} height={24} />
          <Skeleton width={85} height={24} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton width={90} height={32} />
          <Skeleton width={100} height={34} />
        </Box>
      </CardContent>
    </Card>
  );
}

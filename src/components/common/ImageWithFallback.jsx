import { Box } from '@mui/material';
import { handleImageError } from '../../utils/formatters';

export default function ImageWithFallback({
  src,
  alt = 'RentNest Property',
  sx = {},
  ...props
}) {
  return (
    <Box
      component="img"
      src={src || '/fallback-room.svg'}
      alt={alt}
      onError={handleImageError}
      loading="lazy"
      sx={{
        display: 'block',
        objectFit: 'cover',
        backgroundColor: '#F1F5F9',
        ...sx,
      }}
      {...props}
    />
  );
}

import { Box, Typography, Button, Stack } from '@mui/material';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import PermMediaRoundedIcon from '@mui/icons-material/PermMediaRounded';

export function AssetsPanel() {
  return (
    <Box sx={{ p: 2, height: '100%', overflowY: 'auto', textAlign: 'center' }}>
      <Stack spacing={2} alignItems="center" sx={{ py: 6 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
          }}
        >
          <PermMediaRoundedIcon sx={{ fontSize: 28 }} />
        </Box>

        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            Asset Library
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, px: 2 }}>
            Upload project images, vector icons, and graphics to use directly across your canvas.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<CloudUploadRoundedIcon />}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Upload Asset
        </Button>
      </Stack>
    </Box>
  );
}


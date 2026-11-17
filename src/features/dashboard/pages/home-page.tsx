import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';

export function HomePage() {
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Welcome Banner */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={750} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
          Good evening 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to your creative workspace.
        </Typography>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 1,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h3" fontWeight={700} color="text.primary">
                    0
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mt: 0.5 }}>
                    Projects
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    opacity: 0.85,
                    display: 'flex',
                  }}
                >
                  <FolderOpenRoundedIcon fontSize="small" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 1,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h3" fontWeight={700} color="text.primary">
                    0
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mt: 0.5 }}>
                    Pages
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: '#EEF2FF',
                    color: '#4F46E5',
                    display: 'flex',
                  }}
                >
                  <AutoStoriesRoundedIcon fontSize="small" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Projects Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>
            Recent Projects
          </Typography>
          <Button variant="text" size="small" color="primary">
            View all
          </Button>
        </Box>
        <Divider />
        <CardContent sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center' }}>
          <Stack spacing={2} alignItems="center" sx={{ maxWidth: 420, mx: 'auto' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: 'background.default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
                mb: 1,
              }}
            >
              <FolderOpenRoundedIcon sx={{ fontSize: 32, opacity: 0.6 }} />
            </Box>
            <Typography variant="h6" fontWeight={650}>
              No projects yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your projects will appear here when you create one.
            </Typography>
            <Box sx={{ pt: 1 }}>
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineRoundedIcon />}
                sx={{ borderRadius: 2, px: 3, py: 1 }}
              >
                Create New Project
              </Button>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.5 }}>
                Concept preview · Dashboard direction
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Stack,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import { useQuery } from '@tanstack/react-query';
import { useWorkspaceStore } from '../../workspaces/stores/workspace-store';
import { getWorkspaceEntitlements } from '../../workspaces/api/entitlement-api';
import { useProjects, useCreateProject } from '../../projects/hooks/use-projects';
import { ProjectCard } from '../../projects/components/project-card';
import { ProjectFormDialog } from '../../projects/components/project-form';
import { CreateProjectRequest } from '../../projects/api/project-api';
import { routes } from '../../../app/router/routes';

export function HomePage() {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspaceStore();
  const workspaceId = currentWorkspace?.id || '';

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: projects, isLoading: projectsLoading } = useProjects(workspaceId);
  const createMutation = useCreateProject(workspaceId);

  const { data: entitlements } = useQuery({
    queryKey: ['entitlements', workspaceId],
    queryFn: () => getWorkspaceEntitlements(workspaceId),
    enabled: Boolean(workspaceId),
  });

  const projectCount = projects?.length ?? 0;
  const pagesUsed = entitlements?.usage.pages.used ?? 0;
  const pagesLimit = entitlements?.usage.pages.limit ?? 3;

  const handleCreateProject = async (data: CreateProjectRequest) => {
    await createMutation.mutateAsync(data);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Welcome Banner */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={750} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
            Welcome to KLNP Studio 👋
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <BusinessRoundedIcon fontSize="small" color="primary" />
            <Typography variant="body1" fontWeight={600} color="text.primary">
              {currentWorkspace?.name || 'No Workspace Selected'}
            </Typography>
            <Chip
              label={entitlements?.plan.name || 'Free Plan'}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
            />
          </Stack>
        </Box>

        <Button
          variant="outlined"
          onClick={() => navigate(routes.workspaces)}
          sx={{ borderRadius: 2 }}
        >
          Switch Workspace
        </Button>
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
                    {projectCount}
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
                    {pagesUsed}
                    <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 0.5 }}>
                      / {pagesLimit === -1 ? '∞' : pagesLimit}
                    </Typography>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mt: 0.5 }}>
                    Pages Used (Quota)
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

      {/* Projects Section */}
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
            Projects
          </Typography>
          <Button
            variant="text"
            size="small"
            color="primary"
            onClick={() => navigate(routes.projects)}
          >
            View all ({projectCount})
          </Button>
        </Box>
        <Divider />
        <CardContent sx={{ p: 3 }}>
          {projectsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : projects && Array.isArray(projects) && projects.length > 0 ? (
            <Grid container spacing={3}>
              {projects.slice(0, 3).map((project) => (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                  <ProjectCard
                    project={project}
                    onClick={() => navigate(`/projects/${project.id}`)}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Stack spacing={2} alignItems="center" sx={{ maxWidth: 420, mx: 'auto', py: 4, textAlign: 'center' }}>
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
                Create your first project to start designing screens and pages.
              </Typography>
              <Box sx={{ pt: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<AddCircleOutlineRoundedIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                  sx={{ borderRadius: 2, px: 3, py: 1 }}
                >
                  Create New Project
                </Button>
              </Box>
            </Stack>
          )}
        </CardContent>
      </Card>

      <ProjectFormDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateProject}
        loading={createMutation.isPending}
      />
    </Box>
  );
}

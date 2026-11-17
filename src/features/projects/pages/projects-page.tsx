import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Stack,
  Button,
  Grid,
  TextField,
  InputAdornment,
  LinearProgress,
  Paper,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import { useQuery } from '@tanstack/react-query';
import { useWorkspaceStore } from '../../workspaces/stores/workspace-store';
import { getWorkspaceEntitlements } from '../../workspaces/api/entitlement-api';
import {
  useProjects,
  useCreateProject,
  useArchiveProject,
  useRestoreProject,
  useDeleteProject,
} from '../hooks/use-projects';
import { ProjectCard } from '../components/project-card';
import { ProjectFormDialog } from '../components/project-form';
import { CreateProjectRequest } from '../api/project-api';

export function ProjectsPage() {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspaceStore();
  const workspaceId = currentWorkspace?.id || '';

  const [keyword, setKeyword] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: projects, isLoading: projectsLoading } = useProjects(workspaceId, keyword);
  const createMutation = useCreateProject(workspaceId);
  const archiveMutation = useArchiveProject(workspaceId);
  const restoreMutation = useRestoreProject(workspaceId);
  const deleteMutation = useDeleteProject(workspaceId);

  const { data: entitlements } = useQuery({
    queryKey: ['entitlements', workspaceId],
    queryFn: () => getWorkspaceEntitlements(workspaceId),
    enabled: Boolean(workspaceId),
  });

  const pagesUsed = entitlements?.usage.pages.used ?? 0;
  const pagesLimit = entitlements?.usage.pages.limit ?? 3;
  const isAtQuota = pagesLimit !== -1 && pagesUsed >= pagesLimit;

  const handleCreate = async (data: CreateProjectRequest) => {
    try {
      setErrorMsg(null);
      await createMutation.mutateAsync(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create project';
      setErrorMsg(msg);
      throw err;
    }
  };

  if (!workspaceId) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Please select or create a workspace first.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Workspace Plan & Quota Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="h5" fontWeight={700}>
                {currentWorkspace?.name}
              </Typography>
              <Chip
                label={entitlements?.plan.name || 'Free Plan'}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600, height: 24 }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Manage your applications, canvas pages, and project configurations
            </Typography>
          </Box>

          <Box sx={{ minWidth: 220, width: { xs: '100%', md: 'auto' } }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                Page Quota
              </Typography>
              <Typography variant="caption" fontWeight={700} color={isAtQuota ? 'error.main' : 'text.primary'}>
                {pagesUsed} / {pagesLimit === -1 ? 'Unlimited' : pagesLimit} Pages Used
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={pagesLimit === -1 ? 0 : Math.min((pagesUsed / pagesLimit) * 100, 100)}
              color={isAtQuota ? 'error' : 'primary'}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        </Stack>
      </Paper>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}

      {/* Action Bar */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <TextField
          placeholder="Search projects..."
          size="small"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          sx={{ maxWidth: 360 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => setCreateDialogOpen(true)}
          disabled={isAtQuota}
          sx={{ borderRadius: 2, px: 2.5 }}
        >
          Create Project
        </Button>
      </Stack>

      {/* Projects Grid */}
      {projectsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : projects && projects.length > 0 ? (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <ProjectCard
                project={project}
                onClick={() => navigate(`/projects/${project.id}`)}
                onArchive={() => archiveMutation.mutate(project.id)}
                onRestore={() => restoreMutation.mutate(project.id)}
                onDelete={() => deleteMutation.mutate(project.id)}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 3,
            bgcolor: 'background.paper',
          }}
        >
          <FolderOpenRoundedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
            No projects yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first project to start designing your application
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setCreateDialogOpen(true)}
            disabled={isAtQuota}
          >
            Create Project
          </Button>
        </Box>
      )}

      {/* Create Dialog */}
      <ProjectFormDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreate}
        loading={createMutation.isPending}
      />
    </Box>
  );
}

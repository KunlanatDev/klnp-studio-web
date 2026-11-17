import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Container,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '../stores/workspace-store';
import { useAuthStore } from '../../auth/stores/auth-store';
import { routes } from '../../../app/router/routes';
import type { Workspace } from '../api/workspace-api';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

export function WorkspaceDashboardPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const {
    workspaces,
    loading,
    error,
    fetchWorkspaces,
    create,
    update,
    setCurrentWorkspace,
    clearError,
  } = useWorkspaceStore();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createSlug, setCreateSlug] = useState('');
  const [dialogError, setDialogError] = useState('');

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [editName, setEditName] = useState('');

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuWorkspace, setMenuWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, ws: Workspace) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuWorkspace(ws);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setMenuWorkspace(null);
  };

  const handleOpenEdit = () => {
    if (menuWorkspace) {
      setSelectedWorkspace(menuWorkspace);
      setEditName(menuWorkspace.name);
      setEditDialogOpen(true);
    }
    handleCloseMenu();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDialogError('');
    clearError();

    const name = createName.trim();
    const slug = createSlug.trim();

    if (!name) {
      setDialogError('Workspace name is required');
      return;
    }

    if (!slug || slug.length < 3) {
      setDialogError('Slug must be at least 3 characters');
      return;
    }

    try {
      await create(name, slug);
      setCreateDialogOpen(false);
      setCreateName('');
      setCreateSlug('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create workspace';
      setDialogError(msg);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDialogError('');
    clearError();

    if (!selectedWorkspace) return;
    const name = editName.trim();
    if (!name) {
      setDialogError('Workspace name is required');
      return;
    }

    try {
      await update(selectedWorkspace.id, name);
      setEditDialogOpen(false);
      setSelectedWorkspace(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update workspace';
      setDialogError(msg);
    }
  };

  const handleSelectWorkspace = (ws: Workspace) => {
    setCurrentWorkspace(ws);
    navigate(routes.projects);
  };

  const handleLogout = async () => {
    await signOut();
    navigate(routes.login);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          pb: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Workspaces
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Signed in as {user?.email}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setDialogError('');
              setCreateDialogOpen(true);
            }}
          >
            Create Workspace
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && (workspaces?.length ?? 0) === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (workspaces?.length ?? 0) === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            No workspaces found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first workspace to start designing applications in KLNP Studio.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Your First Workspace
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {(workspaces || []).map((ws) => (
            <Grid item xs={12} sm={6} md={4} key={ws.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 4,
                    borderColor: 'primary.main',
                  },
                }}
                onClick={() => handleSelectWorkspace(ws)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} noWrap sx={{ maxWidth: '80%' }}>
                      {ws.name}
                    </Typography>
                    {ws.role === 'owner' && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenMenu(e, ws)}
                        aria-label="workspace options"
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    /{ws.slug}
                  </Typography>

                  <Chip
                    label={ws.role.toUpperCase()}
                    size="small"
                    color={ws.role === 'owner' ? 'primary' : 'default'}
                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                  />
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button size="small" variant="text" color="primary">
                    Open Workspace &rarr;
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Action Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenu}>
        <MenuItem onClick={handleOpenEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Rename Workspace
        </MenuItem>
      </Menu>

      {/* Create Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <form onSubmit={handleCreateSubmit}>
          <DialogTitle fontWeight={600}>Create New Workspace</DialogTitle>
          <DialogContent>
            {dialogError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {dialogError}
              </Alert>
            )}
            <TextField
              autoFocus
              margin="dense"
              label="Workspace Name"
              fullWidth
              required
              value={createName}
              onChange={(e) => {
                setCreateName(e.target.value);
                setCreateSlug(slugify(e.target.value));
              }}
            />
            <TextField
              margin="dense"
              label="Workspace Slug"
              fullWidth
              required
              helperText="URL friendly identifier (e.g. my-studio)"
              value={createSlug}
              onChange={(e) => setCreateSlug(slugify(e.target.value))}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setCreateDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <form onSubmit={handleEditSubmit}>
          <DialogTitle fontWeight={600}>Rename Workspace</DialogTitle>
          <DialogContent>
            {dialogError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {dialogError}
              </Alert>
            )}
            <TextField
              autoFocus
              margin="dense"
              label="Workspace Name"
              fullWidth
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setEditDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}

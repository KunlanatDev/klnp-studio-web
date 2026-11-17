import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Stack,
  Button,
  Paper,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import { useQuery } from '@tanstack/react-query';
import { useWorkspaceStore } from '../../workspaces/stores/workspace-store';
import { getWorkspaceEntitlements } from '../../workspaces/api/entitlement-api';
import { useProject } from '../hooks/use-projects';
import {
  usePages,
  useCreatePage,
  useUpdatePage,
  useDeletePage,
  useDuplicatePage,
  useSetHomePage,
  useReorderPages,
} from '../../pages/hooks/use-pages';
import { Page } from '../../pages/api/page-api';

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspaceStore();
  const workspaceId = currentWorkspace?.id || '';

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [editPage, setEditPage] = useState<Page | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Menu state
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { data: project, isLoading: projectLoading } = useProject(workspaceId, projectId || '');
  const { data: pages, isLoading: pagesLoading } = usePages(workspaceId, projectId || '');

  const createMutation = useCreatePage(workspaceId, projectId || '');
  const updateMutation = useUpdatePage(workspaceId, projectId || '', editPage?.id || '');
  const deleteMutation = useDeletePage(workspaceId, projectId || '');
  const duplicateMutation = useDuplicatePage(workspaceId, projectId || '');
  const setHomeMutation = useSetHomePage(workspaceId, projectId || '');
  const reorderMutation = useReorderPages(workspaceId, projectId || '');

  const { data: entitlements } = useQuery({
    queryKey: ['entitlements', workspaceId],
    queryFn: () => getWorkspaceEntitlements(workspaceId),
    enabled: Boolean(workspaceId),
  });

  const pagesUsed = entitlements?.usage.pages.used ?? 0;
  const pagesLimit = entitlements?.usage.pages.limit ?? 3;
  const isAtQuota = pagesLimit !== -1 && pagesUsed >= pagesLimit;

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>, page: Page) => {
    setSelectedPage(page);
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPage(null);
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim()) return;

    try {
      setErrorMsg(null);
      await createMutation.mutateAsync({
        name: newPageName.trim(),
        slug: newPageSlug.trim() || undefined,
      });
      setNewPageName('');
      setNewPageSlug('');
      setAddDialogOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create page';
      setErrorMsg(msg);
    }
  };

  const handleUpdatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPage || !editName.trim()) return;

    try {
      setErrorMsg(null);
      await updateMutation.mutateAsync({
        name: editName.trim(),
        slug: editSlug.trim() || undefined,
      });
      setEditPage(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update page';
      setErrorMsg(msg);
    }
  };

  const handleMovePage = async (index: number, direction: 'up' | 'down') => {
    if (!pages) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pages.length) return;

    const newOrder = [...pages];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    try {
      setErrorMsg(null);
      await reorderMutation.mutateAsync(newOrder.map((p) => p.id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reorder pages';
      setErrorMsg(msg);
    }
  };

  if (projectLoading || !project) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackRoundedIcon />}
        onClick={() => navigate('/projects')}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        Back to Projects
      </Button>

      {/* Project Details Header */}
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
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="h5" fontWeight={700}>
                {project.name}
              </Typography>
              <Chip
                label={project.platform}
                size="small"
                variant="outlined"
                sx={{ textTransform: 'capitalize', fontWeight: 600 }}
              />
              {project.status === 'archived' && (
                <Chip label="Archived" size="small" color="warning" variant="outlined" />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {project.description || 'No description provided'}
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setAddDialogOpen(true)}
            disabled={isAtQuota}
            sx={{ borderRadius: 2, px: 2.5 }}
          >
            Add Page
          </Button>
        </Stack>
      </Paper>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}

      {/* Pages Section */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight={700}>
              Pages ({pages?.length ?? 0})
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Free plan quota: {pagesUsed} / {pagesLimit === -1 ? 'Unlimited' : pagesLimit} pages
            </Typography>
          </Stack>
        </Box>

        {pagesLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : pages && Array.isArray(pages) && pages.length > 0 ? (
          <List disablePadding>
            {pages.map((page, index) => (
              <ListItem
                key={page.id}
                sx={{
                  py: 1.5,
                  px: 2.5,
                  borderBottom: index < pages.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                secondaryAction={
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditRoundedIcon fontSize="small" />}
                      onClick={() => navigate(`/projects/${projectId}/pages/${page.id}`)}
                      sx={{
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        py: 0.25,
                        px: 1.25,
                        mr: 0.5,
                      }}
                    >
                      Open Editor
                    </Button>

                    <Tooltip title="Move up">
                      <span>
                        <IconButton
                          size="small"
                          disabled={index === 0}
                          onClick={() => handleMovePage(index, 'up')}
                        >
                          <KeyboardArrowUpRoundedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title="Move down">
                      <span>
                        <IconButton
                          size="small"
                          disabled={index === pages.length - 1}
                          onClick={() => handleMovePage(index, 'down')}
                        >
                          <KeyboardArrowDownRoundedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, page)}
                    >
                      <MoreVertRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <ArticleRoundedIcon color={page.is_home ? 'primary' : 'action'} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body1" fontWeight={600}>
                        {page.name}
                      </Typography>
                      {page.is_home && (
                        <Chip
                          icon={<HomeRoundedIcon sx={{ fontSize: '14px !important' }} />}
                          label="Home Page"
                          size="small"
                          color="primary"
                          sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                        />
                      )}
                    </Stack>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      Route: /{page.slug === 'home' ? '' : page.slug} · Pos: {page.position}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No pages in this project</Typography>
          </Box>
        )}
      </Paper>

      {/* Page Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            if (selectedPage) {
              const pid = selectedPage.id;
              handleMenuClose();
              navigate(`/projects/${projectId}/pages/${pid}`);
            }
          }}
        >
          <ListItemIcon>
            <EditRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Open in Editor" />
        </MenuItem>

        {selectedPage && !selectedPage.is_home && (
          <MenuItem
            onClick={() => {
              const pid = selectedPage.id;
              handleMenuClose();
              setHomeMutation.mutate(pid);
            }}
          >
            <ListItemIcon>
              <HomeRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Set as Home" />
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            if (selectedPage) {
              setEditPage(selectedPage);
              setEditName(selectedPage.name);
              setEditSlug(selectedPage.slug);
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <EditRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Rename / Edit Slug" />
        </MenuItem>

        <MenuItem
          onClick={() => {
            const pid = selectedPage?.id;
            handleMenuClose();
            if (pid) duplicateMutation.mutate(pid);
          }}
          disabled={isAtQuota}
        >
          <ListItemIcon>
            <ContentCopyRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Duplicate" />
        </MenuItem>

        <MenuItem
          onClick={() => {
            const pid = selectedPage?.id;
            handleMenuClose();
            if (pid) deleteMutation.mutate(pid);
          }}
          disabled={selectedPage?.is_home}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <DeleteOutlineRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>

      {/* Add Page Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <form onSubmit={handleCreatePage}>
          <DialogTitle sx={{ fontWeight: 700 }}>Add New Page</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Page Name"
                placeholder="e.g. Profile, Settings"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                fullWidth
                required
                autoFocus
              />
              <TextField
                label="Slug (Optional)"
                placeholder="e.g. user-profile"
                value={newPageSlug}
                onChange={(e) => setNewPageSlug(e.target.value)}
                fullWidth
                helperText="URL route identifier (lowercase, hyphens)"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setAddDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending || !newPageName.trim()}
              sx={{ borderRadius: 2 }}
            >
              Add Page
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Page Dialog */}
      <Dialog
        open={Boolean(editPage)}
        onClose={() => setEditPage(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <form onSubmit={handleUpdatePage}>
          <DialogTitle sx={{ fontWeight: 700 }}>Edit Page</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Page Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                fullWidth
                required
                autoFocus
              />
              <TextField
                label="Slug"
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value)}
                fullWidth
                helperText="URL route identifier"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setEditPage(null)} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={updateMutation.isPending || !editName.trim()}
              sx={{ borderRadius: 2 }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

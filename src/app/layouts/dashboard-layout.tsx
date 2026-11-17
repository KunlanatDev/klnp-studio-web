import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Stack,
  IconButton,
  Divider,
  Button,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { routes } from '../router/routes';

const SIDEBAR_WIDTH = 256;
const HEADER_HEIGHT = 64;

export function DashboardLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', path: routes.dashboard, icon: <DashboardRoundedIcon fontSize="small" /> },
    { text: 'Workspaces', path: routes.workspaces, icon: <BusinessRoundedIcon fontSize="small" /> },
    { text: 'Projects', path: routes.projects, icon: <FolderRoundedIcon fontSize="small" /> },
  ];

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
      {/* Brand Header */}
      <Box sx={{ height: HEADER_HEIGHT, display: 'flex', alignItems: 'center', px: 3, gap: 1.5 }}>
        <Avatar
          sx={{
            width: 34,
            height: 34,
            bgcolor: 'primary.main',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}
        >
          KL
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2} color="text.primary">
            KLNP Studio
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Visual App Builder
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, py: 2, px: 2 }}>
        <Typography variant="caption" sx={{ px: 1.5, pb: 1, display: 'block', fontWeight: 600, color: 'text.secondary' }}>
          MAIN MENU
        </Typography>
        <List disablePadding>
          {menuItems.map((item) => {
            const isSelected = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) setMobileOpen(false);
                  }}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: 1.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: isSelected ? 'inherit' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isSelected ? 600 : 500 }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Workspace Footer Info */}
      <Box sx={{ p: 2, m: 2, borderRadius: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
          <LayersRoundedIcon fontSize="small" color="primary" />
          <Typography variant="caption" fontWeight={600} color="text.primary">
            MVP 1 · Sprint 1
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary" display="block">
          Architecture Locked
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          ml: { md: `${SIDEBAR_WIDTH}px` },
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
          height: HEADER_HEIGHT,
        }}
      >
        <Toolbar sx={{ height: HEADER_HEIGHT, px: { xs: 2, sm: 3 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuRoundedIcon />
          </IconButton>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              Dashboard
            </Typography>
            <Chip label="v0.1.0" size="small" variant="outlined" color="primary" sx={{ height: 22, fontSize: '0.75rem' }} />
          </Stack>

          <Button
            variant="contained"
            size="small"
            startIcon={<AddRoundedIcon />}
            sx={{ borderRadius: 2, px: 2 }}
          >
            New Project
          </Button>
        </Toolbar>
      </AppBar>

      {/* Responsive Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: SIDEBAR_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: SIDEBAR_WIDTH },
          }}
        >
          {sidebarContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: SIDEBAR_WIDTH,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {sidebarContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          mt: `${HEADER_HEIGHT}px`,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}


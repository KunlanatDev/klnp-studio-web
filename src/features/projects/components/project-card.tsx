import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import UnarchiveRoundedIcon from '@mui/icons-material/UnarchiveRounded';
import { useState } from 'react';
import { Project } from '../api/project-api';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onDelete?: () => void;
}

export function ProjectCard({
  project,
  onClick,
  onArchive,
  onRestore,
  onDelete,
}: ProjectCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ p: 2.5 }}>
        <CardContent sx={{ p: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                bgcolor: 'primary.light',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {project.platform === 'web' ? (
                <LanguageRoundedIcon />
              ) : (
                <SmartphoneRoundedIcon />
              )}
            </Box>

            <IconButton
              size="small"
              onClick={handleMenuClick}
              sx={{ color: 'text.secondary' }}
            >
              <MoreVertRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5, fontSize: '1.05rem' }}>
            {project.name}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              minHeight: 40,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {project.description || 'No description provided'}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={`${project.page_count} ${project.page_count === 1 ? 'Page' : 'Pages'}`}
              size="small"
              sx={{ fontWeight: 600, fontSize: '0.75rem' }}
            />
            {project.status === 'archived' && (
              <Chip
                label="Archived"
                size="small"
                color="warning"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            )}
          </Stack>
        </CardContent>
      </CardActionArea>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {project.status === 'active' && onArchive && (
          <MenuItem
            onClick={() => {
              handleClose();
              onArchive();
            }}
          >
            <ListItemIcon>
              <ArchiveRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Archive" />
          </MenuItem>
        )}

        {project.status === 'archived' && onRestore && (
          <MenuItem
            onClick={() => {
              handleClose();
              onRestore();
            }}
          >
            <ListItemIcon>
              <UnarchiveRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Restore" />
          </MenuItem>
        )}

        {onDelete && (
          <MenuItem
            onClick={() => {
              handleClose();
              onDelete();
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <DeleteOutlineRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Delete" />
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
}

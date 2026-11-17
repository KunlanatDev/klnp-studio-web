import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import { Page } from '../../../../pages/api/page-api';

interface PagesPanelProps {
  pages?: Page[];
  currentPageId?: string;
  onSelectPage?: (pageId: string) => void;
}

export function PagesPanel({ pages = [], currentPageId, onSelectPage }: PagesPanelProps) {
  return (
    <Box sx={{ p: 1.5, height: '100%', overflowY: 'auto' }}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'text.secondary',
          display: 'block',
          px: 1,
          mb: 1,
        }}
      >
        Project Pages ({pages.length})
      </Typography>

      <List disablePadding>
        {pages.map((p) => {
          const isCurrent = p.id === currentPageId;
          return (
            <ListItem key={p.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                dense
                onClick={() => onSelectPage?.(p.id)}
                sx={{
                  borderRadius: 2,
                  bgcolor: isCurrent ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                  border: '1px solid',
                  borderColor: isCurrent ? 'primary.main' : 'transparent',
                  '&:hover': {
                    bgcolor: isCurrent ? 'rgba(37, 99, 235, 0.12)' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32, color: isCurrent ? 'primary.main' : 'text.secondary' }}>
                  <ArticleRoundedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        fontWeight={isCurrent ? 700 : 500}
                        color={isCurrent ? 'primary.main' : 'text.primary'}
                      >
                        {p.name}
                      </Typography>
                      {p.is_home && (
                        <Chip
                          icon={<HomeRoundedIcon sx={{ fontSize: '12px !important' }} />}
                          label="Home"
                          size="small"
                          color="primary"
                          sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      Route: /{p.slug === 'home' ? '' : p.slug}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}


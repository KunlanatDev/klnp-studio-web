import { createTheme } from '@mui/material/styles';
import { palette } from './palette';

export const appTheme = createTheme({
  palette,
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 650 },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
});


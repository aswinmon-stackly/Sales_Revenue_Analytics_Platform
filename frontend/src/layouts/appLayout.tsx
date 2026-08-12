
import { useState, type ReactNode } from 'react';
import { Avatar, Box, IconButton, Stack, Typography } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import { Sidebar, sidebarTokens } from '../components/sideBar/Sidebar';
import { useAuth } from "../hooks/useAuth";

interface AppLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const serifFont = "";

export function AppLayout({
  title,
  subtitle,
  children,
}: AppLayoutProps) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          component="header"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              px: { xs: 2, md: 4 },
              py: 2,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{ minWidth: 0 }}
            >
              <IconButton
                onClick={() => setMobileOpen(true)}
                sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                aria-label="Open navigation"
              >
                <MenuRoundedIcon />
              </IconButton>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  component="h1"
                  noWrap
                  sx={{
                    fontFamily: serifFont,
                    fontSize: { xs: '1.2rem', md: '1.45rem' },
                    fontWeight: 700,
                    letterSpacing: '-0.005em',
                    lineHeight: 1.25,
                    color: 'text.primary',
                  }}
                >
                  {title}
                </Typography>

                {subtitle && (
                  <Typography
                    noWrap
                    sx={{
                      fontFamily: serifFont,
                      fontSize: '0.85rem',
                      fontStyle: 'italic',
                      fontWeight: 400,
                      color: 'text.secondary',
                      mt: 0.25,
                    }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
            >
              <IconButton
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                }}
                aria-label="Notifications"
              >
                <NotificationsNoneRoundedIcon fontSize="small" />
              </IconButton>

              <Stack
                direction="row"
                alignItems="center"
                spacing={1.25}
                sx={{ pl: 0.5 }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: sidebarTokens.background,
                    fontFamily: serifFont,
                    fontSize: '0.85rem',
                    fontWeight: 700,
                  }}
                >
                  {user?.name
                    ?.split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </Avatar>

                <Box
                  sx={{
                    display: {
                      xs: 'none',
                      sm: 'block',
                    },
                  }}
                >
                  <Typography
                    noWrap
                    sx={{
                      fontFamily: serifFont,
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      lineHeight: 1.25,
                      color: 'text.primary',
                    }}
                  >
                    {user?.name || "User"}
                  </Typography>

                  <Typography
                    noWrap
                    sx={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                    }}
                  >
                    {user?.role || "VIEWER"}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Stack>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            px: { xs: 2, md: 4 },
            py: 3,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
import { useState, type ReactNode } from 'react';
import { Avatar, Box, IconButton, Stack, Typography } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import { Sidebar, sidebarTokens } from '../components/sideBar/Sidebar';

interface AppLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AppLayout({
  title,
  subtitle,
  children,
}: AppLayoutProps) {
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
                  variant="h5"
                  component="h1"
                  noWrap
                >
                  {title}
                </Typography>

                {subtitle && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
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
                    fontSize: '0.9rem',
                  }}
                >
                  MZ
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
                    variant="body2"
                    fontWeight={600}
                    lineHeight={1.2}
                  >
                    Muzafar
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Sales Team
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


// import { Outlet } from "react-router-dom";
// import Sidebar from "../components/sideBar/Sidebar";

// const DashboardLayout = () => {
//   return (
//     <div className="app-layout">
//       <Sidebar />

//       <main className="main-content">
//         <Outlet />
//       </main>
//     </div>
//   );
// };

// export default DashboardLayout;
"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Notifications, Palette, Person, Save, Security } from "@mui/icons-material";
import { PremiumHeader, premiumSurfaceSx } from "@/components/premium/PremiumSurface";

export default function SettingsPage() {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    setSuccess("Settings saved. Demo mode only.");
    setError("");
  };

  const settingCards = [
    { icon: <Person />, label: "Profile", value: "Public artist identity" },
    { icon: <Notifications />, label: "Alerts", value: "Release and payout updates" },
    { icon: <Security />, label: "Security", value: "Account protection" },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <PremiumHeader
        eyebrow="Account"
        title="Settings"
        description="Tune your profile, notifications, interface preference, and account basics from one clean workspace."
      />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "0.85fr 1.4fr" }, gap: 3 }}>
        <Stack spacing={2}>
          {settingCards.map((item) => (
            <Paper
              key={item.label}
              elevation={0}
              sx={{
                ...premiumSurfaceSx(theme),
                p: 2.25,
                borderRadius: "22px",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "14px",
                  display: "grid",
                  placeItems: "center",
                  color: "primary.main",
                  bgcolor: theme.palette.mode === "dark" ? "rgba(91,95,247,0.14)" : "rgba(91,95,247,0.10)",
                }}
              >
                {item.icon}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={850}>{item.label}</Typography>
                <Typography variant="body2" color="text.secondary">{item.value}</Typography>
              </Box>
            </Paper>
          ))}
        </Stack>

        <Paper
          elevation={0}
          sx={{
            ...premiumSurfaceSx(theme),
            p: { xs: 2.5, md: 3.5 },
            borderRadius: "28px",
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={900}>Profile Details</Typography>
              <Typography variant="body2" color="text.secondary">Visible account information and preferences.</Typography>
            </Box>
            <Chip icon={<Palette />} label="Artist" variant="outlined" />
          </Stack>

          <Divider sx={{ mb: 3 }} />

          <Stack spacing={2.25}>
            <TextField
              label="Display Name"
              name="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              fullWidth
              autoComplete="name"
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              autoComplete="email"
            />
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: "18px",
                bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.025)" : "rgba(248,250,252,0.88)",
              }}
            >
              <FormControlLabel
                control={<Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />}
                label="Enable Dark Mode (demo toggle)"
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", ml: 6 }}>
                Theme toggle in top navigation remains the live app control.
              </Typography>
            </Paper>

            {success && <Alert severity="success">{success}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}

            <Button variant="contained" size="large" startIcon={<Save />} onClick={handleSave}>
              Save Changes
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

"use client";
import { Box, Typography, Paper, Divider, Switch, FormControlLabel, Button, TextField, Alert } from "@mui/material";
import { useState } from "react";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    setSuccess("Settings saved! (Demo only)");
    setError("");
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Account Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Keep your artist profile and account preferences current.
        </Typography>
      </Paper>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4 },
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          maxWidth: 760,
        }}
      >
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Display Name"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />}
            label="Enable Dark Mode (demo toggle)"
          />
        </Box>
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Button variant="contained" color="primary" onClick={handleSave} fullWidth>
          Save Changes
        </Button>
      </Paper>
    </Box>
  );
}

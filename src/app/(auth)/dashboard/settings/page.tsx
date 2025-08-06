"use client";
import { Box, Container, Typography, Paper, Divider, Switch, FormControlLabel, Button, TextField, Alert } from "@mui/material";
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
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={1} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Account Settings
        </Typography>
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
    </Container>
  );
}

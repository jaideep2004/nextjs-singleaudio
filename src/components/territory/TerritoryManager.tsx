import React, { useState, useEffect } from 'react';
import { Box, Typography, ToggleButton, ToggleButtonGroup, Autocomplete, TextField, Chip } from '@mui/material';
import countries from '../../utils/countries'; // We'll create this if it doesn't exist

export type TerritoryMode = 'allowed' | 'disallowed';

interface TerritoryManagerProps {
  value: string[];
  mode: TerritoryMode;
  onChange: (countries: string[], mode: TerritoryMode) => void;
}

const TerritoryManager: React.FC<TerritoryManagerProps> = ({ value, mode, onChange }) => {
  const [selected, setSelected] = useState<string[]>(value);
  const [currentMode, setCurrentMode] = useState<TerritoryMode>(mode);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Territory Restrictions</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Select the countries where this track/release is {currentMode === 'allowed' ? 'ALLOWED' : 'DISALLOWED'} for distribution.
      </Typography>
      <ToggleButtonGroup
        value={currentMode}
        exclusive
        onChange={(_, newMode) => {
          if (newMode) {
            setCurrentMode(newMode);
            onChange(selected, newMode);
          }
        }}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="allowed">Allowed</ToggleButton>
        <ToggleButton value="disallowed">Disallowed</ToggleButton>
      </ToggleButtonGroup>
      <Box sx={{ mb: 2 }}>
        <button
          type="button"
          style={{
            padding: '6px 16px',
            marginBottom: 8,
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 500
          }}
          onClick={() => {
            if (selected.length < countries.length) {
              setSelected(countries.map(c => c.code));
              onChange(countries.map(c => c.code), currentMode);
            } else {
              setSelected([]);
              onChange([], currentMode);
            }
          }}
        >
          {selected.length < countries.length ? 'Select All Countries' : 'Clear All Countries'}
        </button>
      </Box>
      <Autocomplete
        multiple
        options={countries}
        getOptionLabel={(option) => option.label}
        value={countries.filter(c => selected.includes(c.code))}
        onChange={(_, newValue) => {
          setSelected(newValue.map(c => c.code));
          onChange(newValue.map(c => c.code), currentMode);
        }}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => (
            <Chip label={option.label} {...getTagProps({ index })} key={option.code} />
          ))
        }
        renderInput={(params) => (
          <TextField {...params} variant="outlined" label="Countries" placeholder="Select countries..." />
        )}
        sx={{ mt: 2, width: '100%' }}
      />
    </Box>
  );
};

export default TerritoryManager;

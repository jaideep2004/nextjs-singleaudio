'use client';

import {
  Box,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Typography,
} from '@mui/material';

export interface SignupStepperProps {
  currentStep: 1 | 2 | 3;
  steps: { label: string }[];
}

export default function SignupStepper({ currentStep, steps }: SignupStepperProps) {
  const progressValue = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <Box sx={{ mb: 4 }}>
      <Stepper
        activeStep={currentStep - 1}
        sx={{
          mb: 2,
          '& .MuiStepLabel-label': {
            color: 'rgba(255,255,255,0.45)',
            fontSize: '0.82rem',
            fontWeight: 500,
          },
          '& .MuiStepLabel-label.Mui-active': {
            color: '#4a6cf7',
            fontWeight: 700,
          },
          '& .MuiStepLabel-label.Mui-completed': {
            color: 'rgba(255,255,255,0.7)',
          },
          '& .MuiStepIcon-root': {
            color: 'rgba(255,255,255,0.15)',
          },
          '& .MuiStepIcon-root.Mui-active': {
            color: '#4a6cf7',
          },
          '& .MuiStepIcon-root.Mui-completed': {
            color: '#22c55e',
          },
          '& .MuiStepConnector-line': {
            borderColor: 'rgba(255,255,255,0.12)',
          },
        }}
      >
        {steps.map((step) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <LinearProgress
        variant="determinate"
        value={progressValue}
        sx={{
          height: 4,
          borderRadius: 2,
          backgroundColor: 'rgba(255,255,255,0.08)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 2,
            background: 'linear-gradient(90deg, #4a6cf7, #7c3aed)',
          },
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.75 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
          Step {currentStep} of {steps.length}
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
          {Math.round(progressValue)}% complete
        </Typography>
      </Box>
    </Box>
  );
}

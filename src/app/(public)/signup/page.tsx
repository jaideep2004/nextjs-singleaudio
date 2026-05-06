'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  ArrowForward,
  ArrowBack,
  Error as ErrorIcon,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '@/context/AppContext';
import { authAPI } from '@/services/api';
import SignupStepper from '@/components/signup/SignupStepper';
import Step1BasicInfo from '@/components/signup/Step1BasicInfo';
import Step2AccountType from '@/components/signup/Step2AccountType';
import Step3Artist, { ArtistNameStatus } from '@/components/signup/Step3Artist';
import Step3Label from '@/components/signup/Step3Label';
import {
  SignupFormValues,
  defaultSignupValues,
  SIGNUP_STEPS,
} from './types';

// Fields validated per step
const STEP_FIELDS: Record<number, (keyof SignupFormValues)[]> = {
  1: ['name', 'email', 'password', 'confirmPassword'],
  2: ['accountType'],
  3: [], // validated dynamically based on accountType
};

const ARTIST_STEP3_FIELDS: (keyof SignupFormValues)[] = [
  'artistName', 'legalName', 'legalAddress', 'phoneNumber',
  'numberOfTracks', 'numberOfReleases', 'governmentIdFile',
];

const LABEL_STEP3_FIELDS: (keyof SignupFormValues)[] = [
  'labelName', 'registrationType', 'totalArtists', 'totalRevenue',
  'catalogSize', 'rightsType',
];

export default function SignupPage() {
  const { signup } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignupEnabled, setIsSignupEnabled] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [artistNameStatus, setArtistNameStatus] = useState<ArtistNameStatus>('idle');
  const artistNameStatusRef = useRef<ArtistNameStatus>('idle');

  const {
    control,
    handleSubmit,
    trigger,
    watch,
    resetField,
    getValues,
    formState: { errors },
  } = useForm<SignupFormValues>({
    defaultValues: defaultSignupValues,
    mode: 'onTouched',
  });

  const accountType = watch('accountType');
  const registrationType = watch('registrationType');
  const companyType = watch('companyType');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check signup enabled
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/settings/signup-enabled');
        const data = await res.json();
        setIsSignupEnabled(data.success ? data.enabled : false);
      } catch {
        setIsSignupEnabled(false);
      } finally {
        setIsLoading(false);
      }
    };
    check();
  }, []);

  const checkArtistName = useCallback(async () => {
    const name = getValues('artistName');
    if (!name || name.trim() === '') return;
    setArtistNameStatus('checking');
    artistNameStatusRef.current = 'checking';
    try {
      const result = await authAPI.checkArtistNameAvailability(name.trim());
      const status: ArtistNameStatus = result.available ? 'available' : 'taken';
      setArtistNameStatus(status);
      artistNameStatusRef.current = status;
    } catch {
      setArtistNameStatus('error');
      artistNameStatusRef.current = 'error';
    }
  }, [getValues]);

  const handleAccountTypeChange = (type: 'artist' | 'label') => {
    // Reset all Step 3 fields of the deselected type
    if (type === 'artist') {
      // Clear label fields
      const labelFields: (keyof SignupFormValues)[] = [
        'labelName', 'registrationType', 'labelLegalName', 'legalEntityName',
        'companyType', 'incorporationCertFile', 'gstCertFile', 'labelGovIdFile',
        'totalArtists', 'totalRevenue', 'catalogSize', 'rightsType',
        'companyWebsite',
      ];
      labelFields.forEach((f) => resetField(f));
    } else {
      // Clear artist fields
      const artistFields: (keyof SignupFormValues)[] = [
        'artistName', 'legalName', 'idType', 'panId', 'aadhaarId',
        'legalAddress', 'phoneNumber', 'numberOfTracks', 'numberOfReleases',
        'governmentIdFile',
      ];
      artistFields.forEach((f) => resetField(f));
      setArtistNameStatus('idle');
    }
  };

  const handleNext = async () => {
    let fieldsToValidate = STEP_FIELDS[currentStep];

    if (currentStep === 3) {
      if (accountType === 'artist') {
        fieldsToValidate = ARTIST_STEP3_FIELDS;
        // Also validate the active ID field
        const idType = getValues('idType');
        fieldsToValidate = [...fieldsToValidate, idType === 'pan' ? 'panId' : 'aadhaarId'];
      } else {
        fieldsToValidate = LABEL_STEP3_FIELDS;
        const regType = getValues('registrationType');
        if (regType === 'individual') {
          fieldsToValidate = [...fieldsToValidate, 'labelLegalName', 'labelGovIdFile'];
        } else if (regType === 'registered_company') {
          fieldsToValidate = [...fieldsToValidate, 'legalEntityName', 'companyType'];
          const ct = getValues('companyType');
          if (ct === 'private') fieldsToValidate = [...fieldsToValidate, 'incorporationCertFile'];
          if (ct === 'public') fieldsToValidate = [...fieldsToValidate, 'gstCertFile'];
        }
      }
    }

    const valid = await trigger(fieldsToValidate as any);
    if (!valid) return;

    if (currentStep < 3) {
      setCurrentStep((s) => (s + 1) as 1 | 2 | 3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => (s - 1) as 1 | 2 | 3);
  };

  const onSubmit = async (data: SignupFormValues) => {
    setServerError(null);

    // Block if artist name not verified
    if (data.accountType === 'artist') {
      await checkArtistName();
      // Read ref after async check completes
      const finalStatus: string = artistNameStatusRef.current;
      if (finalStatus !== 'available') return;
    }

    setIsSubmitting(true);
    try {
      const idNumber =
        data.accountType === 'artist'
          ? data.idType === 'pan'
            ? data.panId
            : data.aadhaarId
          : undefined;

      await signup({
        name: data.name,
        email: data.email,
        password: data.password,
        accountType: data.accountType as 'artist' | 'label',
        // artist
        artistName: data.accountType === 'artist' ? data.artistName : undefined,
        legalName: data.accountType === 'artist' ? data.legalName : undefined,
        idType: data.accountType === 'artist' ? data.idType : undefined,
        idNumber,
        legalAddress: data.accountType === 'artist' ? data.legalAddress : undefined,
        phoneNumber: data.accountType === 'artist' ? data.phoneNumber : undefined,
        numberOfTracks:
          data.accountType === 'artist' && data.numberOfTracks !== ''
            ? Number(data.numberOfTracks)
            : undefined,
        numberOfReleases:
          data.accountType === 'artist' && data.numberOfReleases !== ''
            ? Number(data.numberOfReleases)
            : undefined,
        governmentIdFile: data.accountType === 'artist' ? data.governmentIdFile ?? undefined : undefined,
        // label
        labelName: data.accountType === 'label' ? data.labelName : undefined,
        registrationType:
          data.accountType === 'label'
            ? (data.registrationType as 'individual' | 'registered_company')
            : undefined,
        labelLegalName:
          data.accountType === 'label' && data.registrationType === 'individual'
            ? data.labelLegalName
            : undefined,
        legalEntityName:
          data.accountType === 'label' && data.registrationType === 'registered_company'
            ? data.legalEntityName
            : undefined,
        companyType:
          data.accountType === 'label' && data.registrationType === 'registered_company'
            ? (data.companyType as 'private' | 'public')
            : undefined,
        incorporationCertFile:
          data.accountType === 'label' &&
          data.registrationType === 'registered_company' &&
          data.companyType === 'private'
            ? data.incorporationCertFile ?? undefined
            : undefined,
        gstCertFile:
          data.accountType === 'label' &&
          data.registrationType === 'registered_company' &&
          data.companyType === 'public'
            ? data.gstCertFile ?? undefined
            : undefined,
        labelGovIdFile:
          data.accountType === 'label' && data.registrationType === 'individual'
            ? data.labelGovIdFile ?? undefined
            : undefined,
        totalArtists:
          data.accountType === 'label' && data.totalArtists !== ''
            ? Number(data.totalArtists)
            : undefined,
        totalRevenue:
          data.accountType === 'label' && data.totalRevenue !== ''
            ? Number(data.totalRevenue)
            : undefined,
        catalogSize:
          data.accountType === 'label' && data.catalogSize !== ''
            ? Number(data.catalogSize)
            : undefined,
        rightsType:
          data.accountType === 'label'
            ? (data.rightsType as 'exclusive' | 'non_exclusive')
            : undefined,
        companyWebsite: data.accountType === 'label' ? data.companyWebsite || undefined : undefined,
        socialLinks:
          data.accountType === 'label'
            ? {
                instagram: data.socialLinks.instagram || '',
                twitter: data.socialLinks.twitter || '',
                facebook: data.socialLinks.facebook || '',
                youtube: data.socialLinks.youtube || '',
              }
            : undefined,
      });
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #08111f 0%, #0d1726 45%, #121a2d 100%)',
        }}
      >
        <CircularProgress sx={{ color: '#4a6cf7' }} />
      </Box>
    );
  }

  // Signup disabled
  if (!isSignupEnabled) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #08111f 0%, #0d1726 45%, #121a2d 100%)',
          px: 2,
        }}
      >
        <Box
          sx={{
            maxWidth: 480,
            width: '100%',
            p: { xs: 3, sm: 5 },
            borderRadius: '28px',
            background: 'linear-gradient(180deg, rgba(17,24,39,0.92), rgba(15,23,42,0.85))',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(18px)',
            textAlign: 'center',
          }}
        >
          <ErrorIcon sx={{ fontSize: 56, color: '#ef4444', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', mb: 1.5 }}>
            Registrations Currently Disabled
          </Typography>
          <Typography sx={{ color: 'rgba(226,232,240,0.7)', mb: 3, lineHeight: 1.7 }}>
            We're not accepting new registrations at this time. Please check back later or
            contact support.
          </Typography>
          <Button
            component={Link}
            href="/login"
            variant="contained"
            sx={{
              borderRadius: '14px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #2563eb 0%, #0f766e 100%)',
              px: 4,
              py: 1.5,
            }}
          >
            Go to Login
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100vw',
        ml: 'calc(50% - 50vw)',
        mr: 'calc(50% - 50vw)',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        px: { xs: 2, sm: 3, md: 5, lg: 6 },
        py: { xs: 3, md: 6 },
        background:
          'linear-gradient(180deg, #08111f 0%, #0d1726 45%, #121a2d 100%)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, transparent 34%, rgba(15,118,110,0.1) 100%)',
        }}
      />

      <Box
        sx={{
          maxWidth: 1360,
          mx: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(520px, 600px)' },
            gap: { xs: 3, md: 4, lg: 5 },
            alignItems: 'stretch',
          }}
        >
          {/* Left panel — brand */}
          <Box
            sx={{
              display: { xs: 'none', lg: 'flex' },
              borderRadius: '36px',
              p: { md: 5 },
              minHeight: { lg: 760 },
              flexDirection: 'column',
              justifyContent: 'space-between',
              color: '#f8fafc',
              position: 'relative',
              overflow: 'hidden',
              background:
                'linear-gradient(150deg, rgba(7,19,39,0.92) 0%, rgba(13,28,51,0.88) 54%, rgba(20,48,76,0.92) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 28px 80px rgba(3,10,24,0.34)',
              transform: mounted ? 'translateY(0)' : 'translateY(16px)',
              opacity: mounted ? 1 : 0,
              transition: 'opacity 600ms ease, transform 600ms ease',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(135deg, rgba(89,153,255,0.18) 0%, transparent 42%, rgba(124,58,237,0.12) 100%)',
              }}
            />

            <Stack spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
              <Chip
                label="Karhari Media"
                sx={{
                  alignSelf: 'flex-start',
                  height: 34,
                  px: 1,
                  color: '#dbeafe',
                  bgcolor: 'rgba(148,163,184,0.12)',
                  border: '1px solid rgba(191,219,254,0.14)',
                  fontWeight: 700,
                }}
              />

              <Box>
                <Typography
                  sx={{
                    fontSize: { md: '2.8rem', lg: '3.2rem' },
                    lineHeight: 1.05,
                    fontWeight: 800,
                    letterSpacing: 0,
                  }}
                >
                  Join the platform built for serious music operations.
                </Typography>
                <Typography
                  sx={{
                    mt: 2,
                    maxWidth: 560,
                    fontSize: '1.05rem',
                    lineHeight: 1.7,
                    color: 'rgba(226,232,240,0.72)',
                  }}
                >
                  Whether you're an independent artist or a label managing a full catalog,
                  Karhari Media gives you the tools to distribute, track, and grow.
                </Typography>
              </Box>

              <Stack spacing={1.5}>
                {[
                  'Distribute to 150+ streaming platforms globally',
                  'Real-time royalty tracking and payout management',
                  'Full catalog control with metadata and rights management',
                  'Artist and label workflows built for scale',
                ].map((point) => (
                  <Box
                    key={point}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
                  >
                    <CheckCircle sx={{ color: '#22c55e', fontSize: 18, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.98rem', color: 'rgba(248,250,252,0.88)' }}>
                      {point}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>

            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                mt: 6,
                p: 3,
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: 'rgba(226,232,240,0.65)', fontStyle: 'italic', lineHeight: 1.7 }}
              >
                "Karhari Media transformed how we manage our catalog. The platform is clean,
                fast, and built for professionals."
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255,255,255,0.45)', mt: 1.5, display: 'block' }}
              >
                — Independent Label, Mumbai
              </Typography>
            </Box>
          </Box>

          {/* Right panel — form */}
          <Box
            sx={{
              width: '100%',
              maxWidth: { xs: 640, lg: 'none' },
              mx: { xs: 'auto', lg: 0 },
              borderRadius: { xs: '28px', md: '32px' },
              p: { xs: 2.5, sm: 4, md: 5 },
              alignSelf: 'stretch',
              background:
                'linear-gradient(180deg, rgba(17,24,39,0.92), rgba(15,23,42,0.85))',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 60px rgba(2,8,23,0.38)',
              backdropFilter: 'blur(18px)',
              transform: mounted ? 'translateY(0)' : 'translateY(20px)',
              opacity: mounted ? 1 : 0,
              transition: 'opacity 700ms ease 120ms, transform 700ms ease 120ms',
            }}
          >
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Chip
                label="Karhari Media"
                size="small"
                sx={{
                  mb: 2,
                  color: '#93c5fd',
                  bgcolor: 'rgba(147,197,253,0.1)',
                  border: '1px solid rgba(147,197,253,0.2)',
                  fontWeight: 700,
                  display: { xs: 'inline-flex', lg: 'none' },
                }}
              />
              <Typography
                sx={{
                  fontSize: { xs: '1.7rem', sm: '2rem' },
                  fontWeight: 800,
                  color: '#f8fafc',
                  letterSpacing: 0,
                  lineHeight: 1.1,
                }}
              >
                Create your account
              </Typography>
              <Typography
                sx={{
                  mt: 1,
                  color: 'rgba(226,232,240,0.65)',
                  lineHeight: 1.7,
                }}
              >
                Already have an account?{' '}
                <Link
                  href="/login"
                  style={{ color: '#4a6cf7', fontWeight: 700, textDecoration: 'none' }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>

            {/* Stepper */}
            <SignupStepper currentStep={currentStep} steps={SIGNUP_STEPS} />

            {/* Server error */}
            {serverError && currentStep === 3 && (
              <Alert
                severity="error"
                sx={{ mb: 3, borderRadius: '14px' }}
                onClose={() => setServerError(null)}
              >
                {serverError}
              </Alert>
            )}

            {/* Step content */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              {currentStep === 1 && (
                <Step1BasicInfo
                  control={control}
                  errors={errors}
                  isSubmitting={isSubmitting}
                />
              )}

              {currentStep === 2 && (
                <Step2AccountType
                  control={control}
                  errors={errors}
                  onAccountTypeChange={handleAccountTypeChange}
                />
              )}

              {currentStep === 3 && accountType === 'artist' && (
                <Step3Artist
                  control={control}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  artistNameStatus={artistNameStatus}
                  onArtistNameBlur={checkArtistName}
                />
              )}

              {currentStep === 3 && accountType === 'label' && (
                <Step3Label
                  control={control}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  registrationType={registrationType}
                  companyType={companyType}
                />
              )}

              {/* Navigation buttons */}
              <Stack
                direction={{ xs: 'column-reverse', sm: 'row' }}
                spacing={2}
                sx={{ mt: 4, justifyContent: 'space-between' }}
              >
                {currentStep > 1 ? (
                  <Button
                    onClick={handleBack}
                    disabled={isSubmitting}
                    startIcon={<ArrowBack />}
                    sx={{
                      borderRadius: '14px',
                      color: 'rgba(255,255,255,0.6)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      px: 3,
                      py: 1.5,
                      width: { xs: '100%', sm: 'auto' },
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'rgba(255,255,255,0.05)',
                        borderColor: 'rgba(255,255,255,0.2)',
                      },
                    }}
                  >
                    Back
                  </Button>
                ) : (
                  <Box />
                )}

                {currentStep < 3 ? (
                  <Button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    endIcon={<ArrowForward />}
                    variant="contained"
                    sx={{
                      borderRadius: '14px',
                      fontWeight: 700,
                      fontSize: '1rem',
                      px: 4,
                      py: 1.5,
                      width: { xs: '100%', sm: 'auto' },
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #2563eb 0%, #0f766e 100%)',
                      boxShadow: '0 12px 28px rgba(37,99,235,0.22)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1d4ed8 0%, #0f766e 100%)',
                        boxShadow: '0 16px 32px rgba(37,99,235,0.30)',
                      },
                    }}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    endIcon={
                      isSubmitting ? (
                        <CircularProgress size={18} sx={{ color: 'white' }} />
                      ) : (
                        <ArrowForward />
                      )
                    }
                    variant="contained"
                    sx={{
                      borderRadius: '14px',
                      fontWeight: 700,
                      fontSize: '1rem',
                      px: 4,
                      py: 1.5,
                      width: { xs: '100%', sm: 'auto' },
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #2563eb 0%, #0f766e 100%)',
                      boxShadow: '0 12px 28px rgba(37,99,235,0.22)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1d4ed8 0%, #0f766e 100%)',
                        boxShadow: '0 16px 32px rgba(37,99,235,0.30)',
                      },
                      '&.Mui-disabled': {
                        background: 'rgba(37,99,235,0.4)',
                        color: 'rgba(255,255,255,0.5)',
                      },
                    }}
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </Button>
                )}
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

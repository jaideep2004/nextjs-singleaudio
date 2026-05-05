# Implementation Plan: Signup Form Redesign

## Overview

Replace the single-page signup form with a polished 3-step registration experience for Artists and Labels. The implementation covers backend model/controller/route extensions, a new multer config for registration files, frontend step components, AppContext updates, routing changes, and property-based tests for all 19 correctness properties using fast-check.

Language: **TypeScript** (matches the existing codebase on both client and server).

---

## Tasks

- [x] 1. Backend — Extend User model with onboarding fields
  - Add `accountType: 'artist' | 'label'` field to `UserSchema` in `server/src/models/user.model.ts`
  - Add `artistName` with `unique: true, sparse: true` index (replaces the existing non-unique field)
  - Add `onboarding: Schema.Types.Mixed` field to store `IArtistOnboarding` or `ILabelOnboarding`
  - Export `IArtistOnboarding` and `ILabelOnboarding` interfaces from the model file
  - Add `'label'` to the `UserRole` enum in `server/src/config/constants.ts`
  - _Requirements: 9.2, 9.3, 9.10_

- [x] 2. Backend — Add registration multer config
  - Add `REGISTRATION_DIR` constant (`uploads/registration/`) to `server/src/config/constants.ts`
  - Ensure the directory is created on startup alongside `TRACKS_DIR` and `ARTWORK_DIR`
  - Add `registrationFileFilter` in `server/src/utils/fileUpload.ts` accepting `image/jpeg`, `image/png`, `application/pdf`
  - Export `uploadRegistrationFiles` multer instance with `diskStorage`, 10 MB limit, and the four field names: `governmentIdFile`, `labelGovIdFile`, `incorporationCertFile`, `gstCertFile`
  - _Requirements: 9.1_

- [x] 3. Backend — Add `checkArtistName` controller and route
  - Implement `checkArtistName` in `server/src/controllers/auth.controller.ts`
    - Accept `name` query param; case-insensitive regex search on `artistName`
    - Return `{ available: true/false }` via `successResponse`
  - Add `GET /auth/check-artist-name` to `server/src/routes/auth.routes.ts` (public, no auth middleware)
  - _Requirements: 6.1, 6.3, 6.4_

- [x] 4. Backend — Update `register` controller and validator
  - Update `register` in `server/src/controllers/auth.controller.ts` to:
    - Accept `multipart/form-data` (multer already parses files before the handler runs)
    - Check for duplicate `artistName` and throw `ApiError('Artist name is already taken', 400)`
    - Persist `accountType`, `onboarding` sub-document, and file paths from `req.files`
  - Extend `registerValidator` in `server/src/validators/auth.validator.ts` with new fields: `accountType`, `artistName`, `legalName`, `idType`, `idNumber`, `legalAddress`, `phoneNumber`, `numberOfTracks`, `numberOfReleases`, `labelName`, `registrationType`, `legalEntityName`, `companyType`, `totalArtists`, `totalRevenue`, `catalogSize`, `rightsType`, `companyWebsite`
  - Wire `uploadRegistrationFiles` middleware onto `POST /auth/register` in `auth.routes.ts` before the validator
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 5. Checkpoint — Ensure backend compiles and existing tests pass
  - Run `cd server && npx tsc --noEmit` to verify no TypeScript errors
  - Ask the user if any questions arise before proceeding to frontend work.

- [x] 6. AppContext — Extend `SignupPayload` and update `signup()`
  - Replace the existing `SignupPayload` interface in `src/context/AppContext.tsx` with the full interface from the design (all artist and label fields, file fields typed as `File | undefined`)
  - Update `signup()` to build a `FormData` object when any `File` field is present, setting `Content-Type: multipart/form-data` via axios; fall back to JSON when no files are present
  - Add `checkArtistNameAvailability(name: string): Promise<{ available: boolean }>` to `src/services/api.ts` under `authAPI`
  - _Requirements: 9.1, 9.7_

- [x] 7. Routing — Root redirect and public layout update
  - Replace `src/app/(public)/page.tsx` with a server component that calls `redirect('/login')` from `next/navigation`
  - Remove the `Container` wrapper from `src/app/(public)/layout.tsx` so children render edge-to-edge; render `{children}` directly inside the outer `Box`
  - _Requirements: 1.6, 1.7_

- [x] 8. Frontend — `FileDropZone` component
  - Create `src/components/signup/FileDropZone.tsx` implementing the `FileDropZoneProps` interface from the design
  - Support drag-and-drop (`onDragOver`, `onDrop`) and a hidden `<input type="file">` triggered by a "Browse" button
  - Show selected filename and a clear (×) button when a file is chosen
  - Validate MIME type client-side on drop/select; call `onChange(null)` and set error state for rejected types
  - Use MUI `Box`, `Typography`, `Button`, `IconButton` with dashed border styling matching the dark theme
  - _Requirements: 7.4, 7.5, 7.6, 7.7, 8.8_

- [x] 9. Frontend — `SignupStepper` component
  - Create `src/components/signup/SignupStepper.tsx` implementing `SignupStepperProps`
  - Render MUI `Stepper` with `Step` + `StepLabel` for each of the 3 steps
  - Render a `LinearProgress` bar below the stepper at `((currentStep - 1) / 2) * 100` percent
  - Active step uses primary colour `#4a6cf7`
  - _Requirements: 1.2, 8.6_

- [x] 10. Frontend — `Step1BasicInfo` component
  - Create `src/components/signup/Step1BasicInfo.tsx` implementing `Step1Props`
  - Render Full Name, Email, Password (show/hide), Confirm Password (show/hide) — all via `Controller`
  - Validation rules: name non-empty ≤ 50 chars; email pattern; password ≥ 8 chars; confirmPassword must equal password with error "Passwords do not match"
  - Match login page field styling: `minHeight: 60`, `borderRadius: '18px'`, dark glassmorphism background
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

- [x] 11. Frontend — `Step2AccountType` component
  - Create `src/components/signup/Step2AccountType.tsx` implementing `Step2Props`
  - Render two large MUI `ToggleButton` cards inside a `ToggleButtonGroup` for Artist and Label
  - On change call `onAccountTypeChange` which triggers `resetField` for all Step 3 fields of the deselected type
  - Show validation error when user attempts to advance without selecting a type
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 12. Frontend — `Step3Artist` component
  - Create `src/components/signup/Step3Artist.tsx` implementing `Step3ArtistProps`
  - Render: Artist Name (with uniqueness status adornment), permanent-name warning chip, Legal Name, ID Toggle (PAN/Aadhaar), conditional PAN_ID or Aadhaar_ID field, Full Legal Address (multiline), Phone Number, Number of Tracks, Number of Releases, Government ID Card `FileDropZone` (JPEG/PNG only)
  - PAN validation: `^[A-Z]{5}[0-9]{4}[A-Z]{1}$` with message "Invalid PAN format (e.g. ABCDE1234F)"
  - Aadhaar validation: `^\d{12}$` with message "Aadhaar must be exactly 12 digits"
  - Phone validation: `^\+?[0-9]{10,15}$` with message "Enter a valid phone number (10–15 digits)"
  - Artist Name adornment: spinner when `checking`, CheckCircle when `available`, Error icon when `taken` or `error`
  - _Requirements: 4.1–4.19, 6.1–6.6, 7.1, 7.2, 7.3, 7.4_

- [x] 13. Frontend — `Step3Label` component
  - Create `src/components/signup/Step3Label.tsx` implementing `Step3LabelProps`
  - Render: Label Name, Registration Type toggle (Individual / Registered Company)
  - When Individual: Legal Name field + Government ID `FileDropZone` (JPEG/PNG)
  - When Registered Company: Legal Entity Name + Company Type selector (Private/Public)
    - Private: Incorporation Certificate `FileDropZone` (PDF only)
    - Public: GST Certificate `FileDropZone` (PDF only)
  - Shared fields: Total Artists, Total Revenue, Total Catalog Size, Rights Type selector, optional Company Website (URL validation), optional social links (Instagram, Twitter, Facebook, YouTube — URL validation)
  - _Requirements: 5.1–5.24, 7.5, 7.6, 7.7, 7.8, 7.9_

- [ ] 14. Frontend — Full `SignupPage` rewrite
  - Rewrite `src/app/(public)/signup/page.tsx` as a client component owning the single `useForm<SignupFormValues>` instance and `currentStep: 1 | 2 | 3` state
  - On mount: call `/api/settings/signup-enabled`; show spinner while loading; show disabled message (with link to `/login`) if `enabled: false` or on fetch error (fail-closed)
  - Render `SignupStepper` at the top, then the active step component
  - "Next" button triggers `trigger()` for current-step fields before incrementing step
  - "Back" button decrements step without re-validating
  - On Step 3 submit: if artist and `artistNameStatus !== 'available'`, trigger uniqueness check and block; otherwise call `AppContext.signup()` with full payload
  - Show `Alert` with server error at top of Step 3 on API failure
  - Disable all controls and show `CircularProgress` on submit button while request is in flight
  - Match login page full-bleed dark glassmorphism aesthetic; include Karhari Media brand name in header
  - Fully responsive: mobile ≥ 320px, tablet ≥ 768px, desktop ≥ 1280px
  - _Requirements: 1.1–1.7, 8.1–8.8, 9.7–9.9, 10.1–10.4_

- [ ] 15. Checkpoint — Ensure frontend compiles and renders correctly
  - Run `npx tsc --noEmit` from workspace root to verify no TypeScript errors
  - Ask the user if any questions arise before proceeding to tests.

- [ ] 16. Tests — Install fast-check and set up test infrastructure
  - Install `fast-check` as a dev dependency in the frontend workspace: `npm install --save-dev fast-check`
  - Install `jest`, `@testing-library/react`, `@testing-library/jest-dom`, `jest-environment-jsdom`, `ts-jest` if not already present in the frontend workspace
  - Install `mongodb-memory-server` as a dev dependency in `server/` for backend round-trip tests
  - Create `jest.config.ts` (or update existing) in the workspace root for frontend tests
  - Create `server/jest.config.ts` for backend tests
  - _Requirements: (test infrastructure)_

- [ ] 17. Tests — Property-based tests for validation functions (Properties 4–7, 9–15)
  - Create `src/__tests__/signup/validators.pbt.test.ts`
  - Extract pure validator functions (or import `react-hook-form` `validate` callbacks) and test them with fast-check (minimum 100 iterations each)
  - [ ]* 17.1 Write property test for Full Name length validation
    - **Property 4: Full Name length validation**
    - **Validates: Requirements 2.5**
    - Use `fc.string({ maxLength: 200 })`; assert pass iff `length > 0 && length <= 50`
  - [ ]* 17.2 Write property test for Email format validation
    - **Property 5: Email format validation**
    - **Validates: Requirements 2.6**
    - Use `fc.emailAddress()` for valid; `fc.string()` filtered to non-email for invalid
  - [ ]* 17.3 Write property test for Password length validation
    - **Property 6: Password length validation**
    - **Validates: Requirements 2.7**
    - Use `fc.string({ maxLength: 20 })`; assert pass iff `length >= 8`
  - [ ]* 17.4 Write property test for Confirm Password match validation
    - **Property 7: Confirm password match validation**
    - **Validates: Requirements 2.8, 2.9**
    - Use `fc.tuple(fc.string(), fc.string())`; assert error iff strings differ
  - [ ]* 17.5 Write property test for ID toggle exclusivity
    - **Property 9: ID toggle exclusivity**
    - **Validates: Requirements 4.5, 4.6, 4.14**
    - Use `fc.constantFrom('pan', 'aadhaar')`; assert exactly one field visible/required
  - [ ]* 17.6 Write property test for PAN_ID format validation
    - **Property 10: PAN_ID format validation**
    - **Validates: Requirements 7.1**
    - Use `fc.stringMatching(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)` for valid; `fc.string()` for invalid
  - [ ]* 17.7 Write property test for Aadhaar_ID format validation
    - **Property 11: Aadhaar_ID format validation**
    - **Validates: Requirements 7.2**
    - Use `fc.stringMatching(/^\d{12}$/)` for valid; `fc.string()` for invalid
  - [ ]* 17.8 Write property test for Phone number format validation
    - **Property 12: Phone number format validation**
    - **Validates: Requirements 7.3**
    - Use `fc.stringMatching(/^\+?[0-9]{10,15}$/)` for valid; `fc.string()` for invalid
  - [ ]* 17.9 Write property test for Image file type validation
    - **Property 13: Image MIME type validation**
    - **Validates: Requirements 7.4, 7.5**
    - Use `fc.constantFrom('image/jpeg', 'image/png')` for valid; `fc.string()` filtered for invalid
  - [ ]* 17.10 Write property test for PDF file type validation
    - **Property 14: PDF MIME type validation**
    - **Validates: Requirements 7.6, 7.7**
    - Use `fc.constant('application/pdf')` for valid; `fc.string()` filtered for invalid
  - [ ]* 17.11 Write property test for URL format validation
    - **Property 15: URL format validation**
    - **Validates: Requirements 7.8, 7.9**
    - Use `fc.webUrl()` for valid; `fc.string()` filtered for invalid

- [ ] 18. Tests — Property-based tests for component behaviour (Properties 1–3, 8, 16–17)
  - Create `src/__tests__/signup/components.pbt.test.tsx`
  - Use React Testing Library + fast-check; render components with generated props
  - [ ]* 18.1 Write property test for validation gate (step advancement)
    - **Property 1: Validation gates step advancement**
    - **Validates: Requirements 1.3, 1.4**
    - Generate random combinations of empty/filled required fields; assert step counter does not advance and at least one error is visible when any required field is missing
  - [ ]* 18.2 Write property test for back navigation preserving values
    - **Property 2: Back navigation preserves field values**
    - **Validates: Requirements 1.5**
    - Generate random valid Step 1 + Step 2 values; navigate back and forward; assert all values unchanged
  - [ ]* 18.3 Write property test for step indicator
    - **Property 3: Step indicator reflects current step**
    - **Validates: Requirements 1.2**
    - Use `fc.integer({ min: 1, max: 3 })`; assert active step label, total steps = 3, and LinearProgress value = `((step - 1) / 2) * 100`
  - [ ]* 18.4 Write property test for account type change clearing Step 3 fields
    - **Property 8: Account type change clears Step 3 fields**
    - **Validates: Requirements 3.5**
    - Generate random Step 3 artist values; switch to label; assert all artist-only fields are reset to defaults
  - [ ]* 18.5 Write property test for artist name blur triggering API
    - **Property 16: Artist name uniqueness check triggers on any non-empty blur**
    - **Validates: Requirements 6.1**
    - Use `fc.string({ minLength: 1 })`; mock `checkArtistNameAvailability`; assert mock called exactly once per blur
  - [ ]* 18.6 Write property test for submission blocked when artist name unverified
    - **Property 17: Submission blocked when artist name unverified**
    - **Validates: Requirements 6.6**
    - Generate any artist name without prior `available: true` response; assert submission is blocked and uniqueness check is triggered

- [ ] 19. Tests — Backend round-trip property-based tests (Properties 18–19)
  - Create `server/src/__tests__/auth/registration.pbt.test.ts`
  - Use `mongodb-memory-server` for an in-memory MongoDB instance; spin up before all tests, tear down after
  - [ ]* 19.1 Write property test for artist registration round-trip
    - **Property 18: Artist registration round-trip**
    - **Validates: Requirements 9.2**
    - Use `fc.record(...)` to generate valid artist payloads; call `register` controller directly; fetch created user; assert all non-file fields match submitted values
  - [ ]* 19.2 Write property test for label registration round-trip
    - **Property 19: Label registration round-trip**
    - **Validates: Requirements 9.3**
    - Use `fc.record(...)` to generate valid label payloads for both `registrationType` values; call `register` controller; fetch created user; assert all non-file fields match

- [ ] 20. Tests — Unit tests for backend controllers
  - Create `server/src/__tests__/auth/auth.controller.test.ts`
  - [ ]* 20.1 Write unit tests for `checkArtistName` controller
    - Test: existing name returns `{ available: false }`
    - Test: non-existing name returns `{ available: true }`
    - Test: empty name query param returns 400
    - _Requirements: 6.1, 6.3, 6.4_
  - [ ]* 20.2 Write unit tests for `register` controller
    - Test: duplicate email returns 400 "User already exists with this email"
    - Test: duplicate artist name returns 400 "Artist name is already taken"
    - Test: signup disabled returns 403
    - Test: valid artist payload returns 201 with token
    - Test: valid label payload returns 201 with token
    - _Requirements: 9.4, 9.5, 9.6_

- [ ] 21. Tests — Unit tests for frontend components
  - Create `src/__tests__/signup/components.unit.test.tsx`
  - [ ]* 21.1 Write unit tests for `FileDropZone`
    - Test: renders label, hint, and browse button
    - Test: accepts valid JPEG/PNG file and calls `onChange`
    - Test: rejects invalid file type and shows error message
    - Test: shows filename and clear button when file is selected
    - _Requirements: 7.4, 7.5, 7.6, 7.7, 8.8_
  - [ ]* 21.2 Write unit tests for `SignupStepper`
    - Snapshot at step 1, 2, and 3
    - Test: correct active step label for each of {1, 2, 3}
    - _Requirements: 1.2_
  - [ ]* 21.3 Write unit tests for signup-disabled gate
    - Mock `/api/settings/signup-enabled` returning `enabled: false`; verify form fields are not rendered and disabled message is shown
    - Mock fetch failure; verify disabled message is shown (fail-closed)
    - _Requirements: 10.1–10.4_
  - [ ]* 21.4 Write unit tests for `AppContext.signup()` with FormData
    - Mock axios; assert `FormData` is sent when file fields are present
    - Assert cookie is set and redirect to `/dashboard` on success
    - _Requirements: 9.7_

- [ ] 22. Final checkpoint — Ensure all tests pass
  - Run frontend tests: `npx jest --testPathPattern=signup --passWithNoTests`
  - Run backend tests: `cd server && npx jest --testPathPattern=auth --passWithNoTests`
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Sub-tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check with a minimum of 100 iterations per property
- Tag format for property tests: `// Feature: signup-form-redesign, Property N: <property_text>`
- The `uploads/registration/` directory is created at server startup alongside existing upload dirs
- The public layout change (task 7) removes the `Container` from the layout; pages that need a container (e.g., artist profiles) should add their own `Container` internally
- Backend round-trip tests (task 19) use `mongodb-memory-server` — no live DB connection required

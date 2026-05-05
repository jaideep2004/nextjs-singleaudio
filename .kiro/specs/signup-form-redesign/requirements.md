# Requirements Document

## Introduction

This feature redesigns the signup flow for Karhari Media, a music distribution platform built with Next.js and MUI dark theme. The current single-page signup form is replaced with a comprehensive, multi-step registration experience that collects account-type-specific information for two user categories: Artists and Labels. The redesign captures identity verification data, catalog metadata, and legal information required for onboarding, while extending the backend User model and registration endpoint to persist the new fields.

The root path (`/`) redirects to `/login`. The signup form is accessible at `/signup`.

---

## Glossary

- **Signup_Form**: The multi-step registration UI at `/signup`
- **Step_Indicator**: The visual progress component showing current step and total steps
- **Account_Type_Selector**: The radio/toggle control for choosing Artist or Label
- **Artist_Flow**: The set of fields shown when Account_Type is Artist
- **Label_Flow**: The set of fields shown when Account_Type is Label
- **Artist_Name**: The unique, permanent public identifier for an artist account
- **Legal_Name**: The full government-registered name of an individual
- **Legal_Entity_Name**: The full registered name of a company
- **PAN_ID**: A 10-character alphanumeric Permanent Account Number issued by the Indian Income Tax Department (format: AAAAA9999A)
- **Aadhaar_ID**: A 12-digit unique identification number issued by UIDAI
- **ID_Toggle**: The control that switches between PAN_ID and Aadhaar_ID input
- **Registration_Type**: Whether a label is registered as a company or operates as an individual
- **Company_Type**: Whether a registered company is Private or Public
- **Rights_Type**: Whether the label holds Exclusive or Non-Exclusive rights over catalog
- **Uniqueness_Check_API**: The backend endpoint that verifies artist name availability
- **Register_Endpoint**: `POST /api/auth/register`
- **User_Model**: The Mongoose schema in `server/src/models/user.model.ts`
- **AppContext**: The React context in `src/context/AppContext.tsx` that manages auth state
- **react-hook-form**: The form state management library used throughout the frontend
- **MUI**: Material UI component library used for all UI elements
- **Dark_Theme**: The application theme with primary `#4a6cf7`, background `#0f0f1a`, paper `#1a1a2e`

---

## Requirements

### Requirement 1: Multi-Step Form Structure and Navigation

**User Story:** As a new user, I want to complete registration through clearly separated steps, so that I am not overwhelmed by a long single-page form.

#### Acceptance Criteria

1. THE Signup_Form SHALL consist of exactly three steps: Step 1 (Basic Info), Step 2 (Account Type Selection), and Step 3 (Type-Specific Fields).
2. THE Step_Indicator SHALL display the current step number, total step count, and a labelled progress bar at the top of the form.
3. WHEN a user clicks "Next" on a step, THE Signup_Form SHALL validate all required fields on the current step before advancing.
4. IF validation fails on the current step, THEN THE Signup_Form SHALL display inline field-level error messages and SHALL NOT advance to the next step.
5. WHEN a user clicks "Back", THE Signup_Form SHALL return to the previous step and SHALL preserve all previously entered values.
6. THE Signup_Form SHALL be accessible at the `/signup` route.
7. WHEN a user navigates to `/`, THE Application SHALL redirect the user to `/login`.

---

### Requirement 2: Step 1 — Basic Information

**User Story:** As a new user, I want to provide my core account credentials in the first step, so that my identity and login details are captured before account-type-specific data.

#### Acceptance Criteria

1. THE Signup_Form SHALL render a Full Name text field in Step 1.
2. THE Signup_Form SHALL render an Email ID text field in Step 1.
3. THE Signup_Form SHALL render a Password field with a show/hide toggle in Step 1.
4. THE Signup_Form SHALL render a Confirm Password field with a show/hide toggle in Step 1.
5. WHEN the user submits Step 1, THE Signup_Form SHALL require Full Name to be non-empty and at most 50 characters.
6. WHEN the user submits Step 1, THE Signup_Form SHALL require Email ID to match the pattern `^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$`.
7. WHEN the user submits Step 1, THE Signup_Form SHALL require Password to be at least 8 characters.
8. WHEN the user submits Step 1, THE Signup_Form SHALL require Confirm Password to exactly match the Password field value.
9. IF Confirm Password does not match Password, THEN THE Signup_Form SHALL display the error message "Passwords do not match" beneath the Confirm Password field.

---

### Requirement 3: Step 2 — Account Type Selection

**User Story:** As a new user, I want to choose whether I am registering as an Artist or a Label, so that the form collects the correct information for my account type.

#### Acceptance Criteria

1. THE Account_Type_Selector SHALL present exactly two options: "Artist" and "Label".
2. THE Account_Type_Selector SHALL render as a visually distinct toggle or radio group using MUI components.
3. WHEN a user selects an Account_Type, THE Signup_Form SHALL highlight the selected option and deselect the other.
4. WHEN the user attempts to advance from Step 2 without selecting an Account_Type, THE Signup_Form SHALL display an error message and SHALL NOT advance.
5. WHEN a user changes Account_Type selection, THE Signup_Form SHALL clear all Step 3 field values that belong to the previously selected type.

---

### Requirement 4: Step 3 — Artist-Specific Fields

**User Story:** As an artist registering on the platform, I want to provide my professional and legal details, so that Karhari Media can verify my identity and catalog information.

#### Acceptance Criteria

1. WHEN Account_Type is Artist, THE Signup_Form SHALL render an Artist Name field in Step 3.
2. WHEN Account_Type is Artist, THE Signup_Form SHALL display a persistent warning adjacent to the Artist Name field stating that the artist name is permanent and cannot be changed after registration.
3. WHEN Account_Type is Artist, THE Signup_Form SHALL render a Legal Name field in Step 3.
4. WHEN Account_Type is Artist, THE Signup_Form SHALL render an ID_Toggle that allows the user to switch between PAN_ID and Aadhaar_ID input modes.
5. WHEN the ID_Toggle is set to PAN, THE Signup_Form SHALL render a PAN_ID text field and SHALL hide the Aadhaar_ID field.
6. WHEN the ID_Toggle is set to Aadhaar, THE Signup_Form SHALL render an Aadhaar_ID text field and SHALL hide the PAN_ID field.
7. WHEN Account_Type is Artist, THE Signup_Form SHALL render a Full Legal Address multi-line text field in Step 3.
8. WHEN Account_Type is Artist, THE Signup_Form SHALL render a Phone Number text field in Step 3.
9. WHEN Account_Type is Artist, THE Signup_Form SHALL render a Number of Tracks numeric field in Step 3.
10. WHEN Account_Type is Artist, THE Signup_Form SHALL render a Number of Releases numeric field in Step 3.
11. WHEN Account_Type is Artist, THE Signup_Form SHALL render a Government ID Card image upload control in Step 3.
12. WHEN the user submits Step 3 as an Artist, THE Signup_Form SHALL require Artist Name to be non-empty.
13. WHEN the user submits Step 3 as an Artist, THE Signup_Form SHALL require Legal Name to be non-empty.
14. WHEN the user submits Step 3 as an Artist, THE Signup_Form SHALL require exactly one of PAN_ID or Aadhaar_ID to be provided based on the ID_Toggle state.
15. WHEN the user submits Step 3 as an Artist, THE Signup_Form SHALL require Full Legal Address to be non-empty.
16. WHEN the user submits Step 3 as an Artist, THE Signup_Form SHALL require Phone Number to be non-empty.
17. WHEN the user submits Step 3 as an Artist, THE Signup_Form SHALL require Number of Tracks to be a non-negative integer.
18. WHEN the user submits Step 3 as an Artist, THE Signup_Form SHALL require Number of Releases to be a non-negative integer.
19. WHEN the user submits Step 3 as an Artist, THE Signup_Form SHALL require a Government ID Card image file to be uploaded.

---

### Requirement 5: Step 3 — Label-Specific Fields

**User Story:** As a label registering on the platform, I want to provide my label details and legal structure, so that Karhari Media can verify my organization and catalog rights.

#### Acceptance Criteria

1. WHEN Account_Type is Label, THE Signup_Form SHALL render a Label Name text field in Step 3.
2. WHEN Account_Type is Label, THE Signup_Form SHALL render a Registration_Type selector with options "Individual" and "Registered Company".
3. WHEN Registration_Type is Individual, THE Signup_Form SHALL render a Legal Name field and a Photo of Government ID image upload control.
4. WHEN Registration_Type is Registered Company, THE Signup_Form SHALL render a Legal_Entity_Name field and a Company_Type selector with options "Private" and "Public".
5. WHEN Company_Type is Private, THE Signup_Form SHALL render an Incorporation Certificate PDF upload control and SHALL hide the GST Certificate upload control.
6. WHEN Company_Type is Public, THE Signup_Form SHALL render a GST Certificate PDF upload control and SHALL hide the Incorporation Certificate upload control.
7. WHEN Account_Type is Label, THE Signup_Form SHALL render a Total Artists numeric field in Step 3.
8. WHEN Account_Type is Label, THE Signup_Form SHALL render a Total Revenue from Catalog numeric field in Step 3.
9. WHEN Account_Type is Label, THE Signup_Form SHALL render a Total Catalog Size numeric field in Step 3.
10. WHEN Account_Type is Label, THE Signup_Form SHALL render a Rights_Type selector with options "Exclusive" and "Non-Exclusive".
11. WHEN Account_Type is Label, THE Signup_Form SHALL render a Company Website text field marked as optional in Step 3.
12. WHEN Account_Type is Label, THE Signup_Form SHALL render optional social link text fields for Instagram, Twitter, Facebook, and YouTube in Step 3.
13. WHEN the user submits Step 3 as a Label, THE Signup_Form SHALL require Label Name to be non-empty.
14. WHEN the user submits Step 3 as a Label, THE Signup_Form SHALL require Registration_Type to be selected.
15. WHEN Registration_Type is Individual and the user submits Step 3, THE Signup_Form SHALL require Legal Name to be non-empty.
16. WHEN Registration_Type is Individual and the user submits Step 3, THE Signup_Form SHALL require a Photo of Government ID image file to be uploaded.
17. WHEN Registration_Type is Registered Company and the user submits Step 3, THE Signup_Form SHALL require Legal_Entity_Name to be non-empty.
18. WHEN Registration_Type is Registered Company and the user submits Step 3, THE Signup_Form SHALL require Company_Type to be selected.
19. WHEN Company_Type is Private and the user submits Step 3, THE Signup_Form SHALL require an Incorporation Certificate PDF file to be uploaded.
20. WHEN Company_Type is Public and the user submits Step 3, THE Signup_Form SHALL require a GST Certificate PDF file to be uploaded.
21. WHEN the user submits Step 3 as a Label, THE Signup_Form SHALL require Total Artists to be a non-negative integer.
22. WHEN the user submits Step 3 as a Label, THE Signup_Form SHALL require Total Revenue from Catalog to be a non-negative number.
23. WHEN the user submits Step 3 as a Label, THE Signup_Form SHALL require Total Catalog Size to be a non-negative integer.
24. WHEN the user submits Step 3 as a Label, THE Signup_Form SHALL require Rights_Type to be selected.

---

### Requirement 6: Artist Name Uniqueness Validation

**User Story:** As an artist, I want to know immediately if my chosen artist name is already taken, so that I can select a unique name before submitting the form.

#### Acceptance Criteria

1. WHEN the Artist Name field loses focus and contains a non-empty value, THE Signup_Form SHALL call the Uniqueness_Check_API to verify availability.
2. WHILE the Uniqueness_Check_API call is in progress, THE Signup_Form SHALL display a loading indicator adjacent to the Artist Name field.
3. WHEN the Uniqueness_Check_API returns that the name is already taken, THE Signup_Form SHALL display an error message "This artist name is already taken" beneath the Artist Name field.
4. WHEN the Uniqueness_Check_API returns that the name is available, THE Signup_Form SHALL display a success indicator adjacent to the Artist Name field.
5. IF the Uniqueness_Check_API call fails due to a network error, THEN THE Signup_Form SHALL display the message "Unable to verify artist name availability. Please try again." and SHALL allow the user to retry.
6. WHEN the user submits Step 3 as an Artist and the Artist Name has not been confirmed as available, THE Signup_Form SHALL block submission and SHALL trigger the Uniqueness_Check_API call.

---

### Requirement 7: Field Validation Rules

**User Story:** As a user, I want clear validation feedback on all fields, so that I can correct errors before submitting the form.

#### Acceptance Criteria

1. WHEN a PAN_ID value is entered, THE Signup_Form SHALL validate it against the pattern `^[A-Z]{5}[0-9]{4}[A-Z]{1}$` and SHALL display "Invalid PAN format (e.g. ABCDE1234F)" if it does not match.
2. WHEN an Aadhaar_ID value is entered, THE Signup_Form SHALL validate it as exactly 12 digits and SHALL display "Aadhaar must be exactly 12 digits" if it does not match.
3. WHEN a Phone Number value is entered, THE Signup_Form SHALL validate it against the pattern `^\+?[0-9]{10,15}$` and SHALL display "Enter a valid phone number (10–15 digits)" if it does not match.
4. WHEN a Government ID Card file is selected, THE Signup_Form SHALL accept only JPEG and PNG image files and SHALL display "Only JPEG or PNG images are accepted" if another file type is selected.
5. WHEN a Photo of Government ID file is selected for a Label Individual, THE Signup_Form SHALL accept only JPEG and PNG image files and SHALL display "Only JPEG or PNG images are accepted" if another file type is selected.
6. WHEN an Incorporation Certificate file is selected, THE Signup_Form SHALL accept only PDF files and SHALL display "Only PDF files are accepted" if another file type is selected.
7. WHEN a GST Certificate file is selected, THE Signup_Form SHALL accept only PDF files and SHALL display "Only PDF files are accepted" if another file type is selected.
8. WHEN a Company Website URL is entered, THE Signup_Form SHALL validate it as a well-formed URL beginning with `http://` or `https://` and SHALL display "Enter a valid URL (e.g. https://example.com)" if it does not match.
9. WHEN a social link URL is entered for any platform, THE Signup_Form SHALL validate it as a well-formed URL beginning with `http://` or `https://` and SHALL display "Enter a valid URL" if it does not match.

---

### Requirement 8: Visual Design and Dark Theme

**User Story:** As a user, I want the signup form to match the existing platform aesthetic, so that the experience feels consistent and professional.

#### Acceptance Criteria

1. THE Signup_Form SHALL use the Dark_Theme palette: primary `#4a6cf7`, background `#0f0f1a`, paper `#1a1a2e`.
2. THE Signup_Form SHALL use MUI components exclusively for all form controls, layout, and feedback elements.
3. THE Signup_Form SHALL use react-hook-form with Controller wrappers for all controlled inputs.
4. THE Signup_Form SHALL match the visual style of the existing login page, including border-radius, glassmorphism card treatment, gradient backgrounds, and typography scale.
5. THE Signup_Form SHALL display the Karhari Media brand name or logo in the form header.
6. THE Step_Indicator SHALL use the primary colour `#4a6cf7` to highlight the active step.
7. THE Signup_Form SHALL be fully responsive across mobile (≥ 320px), tablet (≥ 768px), and desktop (≥ 1280px) viewport widths.
8. WHEN a file upload control is rendered, THE Signup_Form SHALL display a drag-and-drop zone with a file type hint and a fallback "Browse" button.

---

### Requirement 9: Form Submission and Backend Integration

**User Story:** As a new user, I want my registration data to be saved correctly on the backend, so that I can log in and access the platform immediately after signing up.

#### Acceptance Criteria

1. WHEN the user submits the completed form on Step 3, THE Signup_Form SHALL send a single POST request to the Register_Endpoint with all collected fields serialised as `multipart/form-data` to support file uploads.
2. WHEN the Register_Endpoint receives a registration request, THE Register_Endpoint SHALL persist all Artist-specific fields (artistName, legalName, idType, idNumber, legalAddress, phoneNumber, numberOfTracks, numberOfReleases, governmentIdFile) to the User_Model.
3. WHEN the Register_Endpoint receives a registration request, THE Register_Endpoint SHALL persist all Label-specific fields (labelName, registrationType, legalName or legalEntityName, companyType, certificateFile, totalArtists, totalRevenue, catalogSize, rightsType, companyWebsite, socialLinks) to the User_Model.
4. WHEN the Register_Endpoint successfully creates a user, THE Register_Endpoint SHALL return a JWT token and the user profile in the response body with HTTP status 201.
5. IF the Register_Endpoint receives a duplicate email, THEN THE Register_Endpoint SHALL return HTTP status 400 with the message "User already exists with this email".
6. IF the Register_Endpoint receives a duplicate Artist Name, THEN THE Register_Endpoint SHALL return HTTP status 400 with the message "Artist name is already taken".
7. WHEN registration succeeds, THE AppContext SHALL store the JWT token in a cookie and SHALL redirect the user to `/dashboard`.
8. WHILE the registration request is in flight, THE Signup_Form SHALL display a loading state on the submit button and SHALL disable all form controls.
9. IF the Register_Endpoint returns an error, THEN THE Signup_Form SHALL display the server error message in an Alert component at the top of Step 3.
10. THE User_Model SHALL enforce uniqueness on the artistName field at the database index level.

---

### Requirement 10: Signup Availability Gate

**User Story:** As a platform operator, I want to be able to disable new registrations, so that I can control onboarding during maintenance or closed-beta periods.

#### Acceptance Criteria

1. WHEN the Signup_Form page loads, THE Signup_Form SHALL call the `/api/settings/signup-enabled` endpoint to check whether registration is open.
2. WHILE the availability check is in progress, THE Signup_Form SHALL display a loading spinner and SHALL NOT render the form fields.
3. IF the availability check returns `enabled: false`, THEN THE Signup_Form SHALL display a "Registrations Currently Disabled" message with a link to `/login` and SHALL NOT render the form fields.
4. IF the availability check request fails, THEN THE Signup_Form SHALL default to treating registration as disabled and SHALL display the disabled message.

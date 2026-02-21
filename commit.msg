ui: Apply consistent back navigation in Auth forms

- Added the "Volver" textual return button component symmetrically
  across 'SignUp', 'ForgotPassword', 'ResetPassword', 'VerifyMFA', and 'SetupMFA'.
- Removed duplicate navigation links to "Volver al inicio" at the bottom of these forms.
- Re-styled layout headers to be closer to 'MyProfile' behavior.
- In `VerifyMFA.tsx`, canceling the MFA challenge now calls `signOut()` via Amplfy Auth 
  to properly abort the incomplete login process.

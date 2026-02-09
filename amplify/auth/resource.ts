import { defineAuth } from "@aws-amplify/backend";

/**
 * Amplify Auth is optional for this app (we use Auth.js for Google OAuth).
 * Define a minimal auth for Amplify backend validity; app auth is via Auth.js.
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
});

import { SignInButton } from "./SignInButton";

const ERROR_MESSAGES: Record<string, string> = {
  MissingCSRF: "Sign-in request expired or was invalid. Please try again.",
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "Access denied.",
  Verification:
    "The sign-in link was already used or has expired. Please try again.",
  Default: "Something went wrong signing in. Please try again.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const errorCode = params?.error ?? null;
  const errorMessage =
    errorCode && ERROR_MESSAGES[errorCode]
      ? ERROR_MESSAGES[errorCode]
      : errorCode
        ? ERROR_MESSAGES.Default
        : null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-purple-100 to-purple-200">
      <h1 className="text-2xl font-bold text-purple-900 mb-6">Sign in</h1>
      {errorMessage && (
        <div
          className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm text-center max-w-sm"
          role="alert"
        >
          {errorMessage}
        </div>
      )}
      <SignInButton />
      <p className="mt-6 text-sm text-purple-800 text-center max-w-xs">
        Sign in to create and manage your dance fundraiser.
      </p>
    </main>
  );
}

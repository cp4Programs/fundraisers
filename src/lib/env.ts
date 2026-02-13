/**
 * App config from env. For local sandbox, run `node scripts/load-amplify-outputs.js`
 * after `npx ampx sandbox` to copy table/bucket names into .env.local.
 * (Env-only here so this module is safe for Edge runtime.)
 */

export function getFundraiserTableName(): string {
  return process.env.FUNDRAISER_TABLE_NAME?.trim() ?? "";
}

export function getNextAuthTableName(): string {
  return process.env.NEXTAUTH_TABLE_NAME?.trim() ?? "";
}

export function getAssetsBucketName(): string {
  return process.env.FUNDRAISER_ASSETS_BUCKET?.trim() ?? "";
}

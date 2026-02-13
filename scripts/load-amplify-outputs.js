#!/usr/bin/env node
/**
 * After running `npx ampx sandbox`, run this script to copy FundraiserTableName,
 * NextAuthTableName, and AssetsBucketName from amplify_outputs.json into .env.local.
 *
 * Usage: node scripts/load-amplify-outputs.js
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputsPath = path.join(root, "amplify_outputs.json");
const envPath = path.join(root, ".env.local");

if (!fs.existsSync(outputsPath)) {
  console.error("amplify_outputs.json not found. Run `npx ampx sandbox` first.");
  process.exit(1);
}

let outputs;
try {
  outputs = JSON.parse(fs.readFileSync(outputsPath, "utf-8"));
} catch (e) {
  console.error("Failed to read amplify_outputs.json:", e.message);
  process.exit(1);
}

const custom = outputs?.custom;
if (!custom) {
  console.error("amplify_outputs.json has no 'custom' key. Ensure backend.addOutput() is used.");
  process.exit(1);
}

const vars = {
  FUNDRAISER_TABLE_NAME: custom.FundraiserTableName,
  NEXTAUTH_TABLE_NAME: custom.NextAuthTableName,
  FUNDRAISER_ASSETS_BUCKET: custom.AssetsBucketName,
};

let envContent = "";
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, "utf-8");
}

const lines = envContent.split("\n");
const keys = new Set(lines.map((line) => line.split("=")[0].trim()).filter(Boolean));

for (const [key, value] of Object.entries(vars)) {
  if (value == null || value === "") continue;
  const newLine = `${key}=${value}`;
  if (keys.has(key)) {
    const idx = lines.findIndex((l) => l.startsWith(key + "="));
    if (idx >= 0) lines[idx] = newLine;
  } else {
    lines.push(newLine);
  }
}

fs.writeFileSync(envPath, lines.join("\n") + (lines[lines.length - 1] === "" ? "" : "\n"));
console.log("Updated .env.local with FundraiserTableName, NEXTAUTH_TABLE_NAME, FUNDRAISER_ASSETS_BUCKET.");
console.log("Restart the dev server to pick up the new values.");

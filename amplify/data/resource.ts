import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/**
 * Placeholder schema so Amplify backend is valid.
 * App data lives in custom DynamoDB single table (see backend.ts).
 */
const schema = a.schema({
  Placeholder: a
    .model({
      name: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: { expiresInDays: 30 },
  },
});

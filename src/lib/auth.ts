import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDBAdapter } from "@auth/dynamodb-adapter";

const tableName = process.env.NEXTAUTH_TABLE_NAME ?? "";

const dynamoConfig =
  process.env.AUTH_DYNAMODB_ID && process.env.AUTH_DYNAMODB_SECRET
    ? {
        credentials: {
          accessKeyId: process.env.AUTH_DYNAMODB_ID,
          secretAccessKey: process.env.AUTH_DYNAMODB_SECRET,
        },
        region: process.env.AUTH_DYNAMODB_REGION ?? process.env.AWS_REGION ?? "us-east-1",
      }
    : { region: process.env.AUTH_DYNAMODB_REGION ?? process.env.AWS_REGION ?? "us-east-1" };

const dynamoClient = new DynamoDB(dynamoConfig as { region: string; credentials?: { accessKeyId: string; secretAccessKey: string } });
const docClient = DynamoDBDocument.from(dynamoClient, {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: tableName ? DynamoDBAdapter(docClient, { tableName }) : undefined,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
  ],
  session: { strategy: "database", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  trustHost: true,
});

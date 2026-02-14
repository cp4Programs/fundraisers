import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDBAdapter } from "@auth/dynamodb-adapter";
import { getNextAuthTableName } from "./env";

const tableName = getNextAuthTableName();

/** JWT session lifetime: 1 hour. Sliding window via client update() refreshes the token. */
const JWT_SESSION_MAX_AGE_SEC = 60 * 60;

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
  session: {
    strategy: tableName ? "database" : "jwt",
    maxAge: tableName ? 30 * 24 * 60 * 60 : JWT_SESSION_MAX_AGE_SEC,
  },
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user, account, profile, trigger, session: updateSession }) {
      if (user ?? account) {
        const accountWithId = account as { sub?: string; providerAccountId?: string } | undefined;
        const profileWithId = profile as { sub?: string; id?: string } | undefined;
        const sub =
          accountWithId?.sub ??
          accountWithId?.providerAccountId ??
          (user as { id?: string } | undefined)?.id ??
          profileWithId?.sub ??
          profileWithId?.id;
        if (sub) {
          token.sub = sub;
          token.id = sub;
        }
        token.exp = Math.floor(Date.now() / 1000) + JWT_SESSION_MAX_AGE_SEC;
        return token;
      }
      if (trigger === "update" && updateSession) {
        token.exp = Math.floor(Date.now() / 1000) + JWT_SESSION_MAX_AGE_SEC;
      }
      return token;
    },
    async session({ session, token, user }) {
      if (session.user) {
        // database strategy passes `user`, JWT strategy passes `token`
        const id = user?.id ?? token?.sub ?? token?.id ?? "";
        session.user.id = id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  trustHost: true,
});

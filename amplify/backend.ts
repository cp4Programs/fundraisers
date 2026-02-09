import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import { CfnOutput, RemovalPolicy } from "aws-cdk-lib";

const backend = defineBackend({
  auth,
  data,
});

/**
 * Single-table DynamoDB for fundraisers, squares, and user profiles.
 * PK/SK: USER#id/PROFILE, FUNDRAISER#id/META, FUNDRAISER#id/SQUARE#index.
 * GSI1: GSI1PK = USER#id, GSI1SK = FUNDRAISER#id (list fundraisers by user).
 */
const fundraiserStack = backend.createStack("FundraiserData");
const fundraiserTable = new dynamodb.Table(fundraiserStack, "AnDanceFundraiser", {
  partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
  sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  removalPolicy: RemovalPolicy.DESTROY,
});
fundraiserTable.addGlobalSecondaryIndex({
  indexName: "GSI1",
  partitionKey: { name: "GSI1PK", type: dynamodb.AttributeType.STRING },
  sortKey: { name: "GSI1SK", type: dynamodb.AttributeType.STRING },
  projectionType: dynamodb.ProjectionType.ALL,
});
new CfnOutput(fundraiserStack, "FundraiserTableName", {
  value: fundraiserTable.tableName,
  description: "DynamoDB table name for fundraiser app data",
  exportName: "FundraiserTableName",
});

/**
 * Auth.js / NextAuth DynamoDB adapter table.
 * Keys: pk, sk; GSI1: GSI1PK, GSI1SK. TTL: expires.
 */
const authStack = backend.createStack("NextAuthData");
const nextAuthTable = new dynamodb.Table(authStack, "NextAuth", {
  partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
  sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  removalPolicy: RemovalPolicy.DESTROY,
  timeToLiveAttribute: "expires",
});
nextAuthTable.addGlobalSecondaryIndex({
  indexName: "GSI1",
  partitionKey: { name: "GSI1PK", type: dynamodb.AttributeType.STRING },
  sortKey: { name: "GSI1SK", type: dynamodb.AttributeType.STRING },
  projectionType: dynamodb.ProjectionType.ALL,
});
new CfnOutput(authStack, "NextAuthTableName", {
  value: nextAuthTable.tableName,
  description: "DynamoDB table name for Auth.js adapter",
  exportName: "NextAuthTableName",
});

/**
 * S3 bucket for dancer photos and generated share images.
 */
const storageStack = backend.createStack("FundraiserStorage");
const assetsBucket = new s3.Bucket(storageStack, "FundraiserAssets", {
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  cors: [
    {
      allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.HEAD],
      allowedOrigins: ["*"],
      allowedHeaders: ["*"],
    },
  ],
});
new CfnOutput(storageStack, "AssetsBucketName", {
  value: assetsBucket.bucketName,
  description: "S3 bucket for fundraiser images",
  exportName: "FundraiserAssetsBucketName",
});

export default backend;

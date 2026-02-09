import {
  BatchWriteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { getAllCellIndices, getCellDisplay, getCellDollarAmount } from "./board";

const client = new DynamoDBClient({});
const TableName = process.env.FUNDRAISER_TABLE_NAME ?? "";

// --- Types matching single-table design ---

export type SquareStatus = "available" | "pending" | "claimed";

export interface UserProfile {
  PK: string; // USER#<userId>
  SK: string; // PROFILE
  name?: string;
  email?: string;
  venmoHandle?: string;
  zelleEmail?: string;
  zellePhone?: string;
  avatarUrl?: string;
  GSI1PK?: string;
  GSI1SK?: string;
}

export interface FundraiserMeta {
  PK: string; // FUNDRAISER#<id>
  SK: string; // META
  userId: string;
  slug: string;
  title: string;
  dancerName: string;
  dancerPhotoS3Key?: string;
  status: "draft" | "active" | "ended";
  createdAt: string; // ISO
  venmoHandle?: string;
  zelleEmail?: string;
  zellePhone?: string;
  GSI1PK: string; // USER#<userId>
  GSI1SK: string; // FUNDRAISER#<id>
}

export interface SquareRecord {
  PK: string; // FUNDRAISER#<id>
  SK: string; // SQUARE#<cellIndex>
  cellIndex: number;
  displayValue: number | "star";
  dollarAmount: number | null;
  status: SquareStatus;
  donorName?: string;
  claimedAt?: string;
}

export type FundraiserWithSquares = FundraiserMeta & { squares: SquareRecord[] };

// --- Helpers ---

function pkUser(userId: string) {
  return `USER#${userId}`;
}
function pkFundraiser(id: string) {
  return `FUNDRAISER#${id}`;
}
function skSquare(cellIndex: number) {
  return `SQUARE#${cellIndex}`;
}

// --- User profile ---

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!TableName) return null;
  const res = await client.send(
    new GetItemCommand({
      TableName,
      Key: marshall({ PK: pkUser(userId), SK: "PROFILE" }),
    })
  );
  if (!res.Item) return null;
  return unmarshall(res.Item) as UserProfile;
}

export async function putUserProfile(profile: Omit<UserProfile, "PK" | "SK"> & { userId: string }): Promise<void> {
  if (!TableName) return;
  const item: UserProfile = {
    PK: pkUser(profile.userId),
    SK: "PROFILE",
    ...profile,
  };
  await client.send(new PutItemCommand({ TableName, Item: marshall(item) }));
}

// --- Fundraiser ---

export async function getFundraiserById(id: string): Promise<FundraiserMeta | null> {
  if (!TableName) return null;
  const res = await client.send(
    new GetItemCommand({
      TableName,
      Key: marshall({ PK: pkFundraiser(id), SK: "META" }),
    })
  );
  if (!res.Item) return null;
  return unmarshall(res.Item) as FundraiserMeta;
}

export async function getFundraiserBySlug(slug: string): Promise<FundraiserMeta | null> {
  return getFundraiserBySlugFromDb(slug);
}

export async function getFundraiserWithSquares(id: string): Promise<FundraiserWithSquares | null> {
  const meta = await getFundraiserById(id);
  if (!meta) return null;
  const squares = await getSquaresForFundraiser(id);
  return { ...meta, squares };
}

export async function getFundraiserWithSquaresBySlug(slug: string): Promise<FundraiserWithSquares | null> {
  const meta = await getFundraiserBySlug(slug);
  if (!meta) return null;
  const squares = await getSquaresForFundraiser(meta.PK.replace("FUNDRAISER#", ""));
  return { ...meta, squares };
}

export async function listFundraisersByUser(userId: string): Promise<FundraiserMeta[]> {
  if (!TableName) return [];
  const res = await client.send(
    new QueryCommand({
      TableName,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pk AND begins_with(GSI1SK, :sk)",
      ExpressionAttributeValues: marshall({ ":pk": pkUser(userId), ":sk": "FUNDRAISER#" }),
    })
  );
  const items = (res.Items ?? []).map((i) => unmarshall(i) as FundraiserMeta);
  return items;
}

async function getFundraiserBySlugFromDb(slug: string): Promise<FundraiserMeta | null> {
  if (!TableName) return null;
  const res = await client.send(
    new ScanCommand({
      TableName,
      FilterExpression: "SK = :sk AND #slug = :slug",
      ExpressionAttributeNames: { "#slug": "slug" },
      ExpressionAttributeValues: marshall({ ":sk": "META", ":slug": slug }),
    })
  );
  const items = (res.Items ?? []).map((i) => unmarshall(i) as FundraiserMeta);
  return items[0] ?? null;
}

// --- Squares ---

export async function getSquaresForFundraiser(fundraiserId: string): Promise<SquareRecord[]> {
  if (!TableName) return [];
  const res = await client.send(
    new QueryCommand({
      TableName,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: marshall({ ":pk": pkFundraiser(fundraiserId), ":sk": "SQUARE#" }),
    })
  );
  const items = (res.Items ?? []).map((i) => unmarshall(i) as SquareRecord);
  return items.sort((a, b) => a.cellIndex - b.cellIndex);
}

export interface CreateFundraiserInput {
  userId: string;
  slug: string;
  title: string;
  dancerName: string;
  dancerPhotoS3Key?: string;
  venmoHandle?: string;
  zelleEmail?: string;
  zellePhone?: string;
}

export async function createFundraiser(input: CreateFundraiserInput): Promise<FundraiserMeta> {
  if (!TableName) throw new Error("FUNDRAISER_TABLE_NAME not set");
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const meta: FundraiserMeta = {
    PK: pkFundraiser(id),
    SK: "META",
    userId: input.userId,
    slug: input.slug,
    title: input.title,
    dancerName: input.dancerName,
    dancerPhotoS3Key: input.dancerPhotoS3Key,
    status: "active",
    createdAt: now,
    venmoHandle: input.venmoHandle,
    zelleEmail: input.zelleEmail,
    zellePhone: input.zellePhone,
    GSI1PK: pkUser(input.userId),
    GSI1SK: pkFundraiser(id),
  };
  await client.send(new PutItemCommand({ TableName, Item: marshall(meta) }));

  const indices = getAllCellIndices();
  const putRequests = indices.map((cellIndex) => ({
    PutRequest: {
      Item: marshall({
        PK: pkFundraiser(id),
        SK: skSquare(cellIndex),
        cellIndex,
        displayValue: getCellDisplay(cellIndex),
        dollarAmount: getCellDollarAmount(cellIndex),
        status: "available" as SquareStatus,
      }),
    },
  }));
  for (let i = 0; i < putRequests.length; i += 25) {
    const chunk = putRequests.slice(i, i + 25);
    await client.send(
      new BatchWriteItemCommand({
        RequestItems: { [TableName]: chunk },
      })
    );
  }
  return meta;
}

export async function claimSquare(
  fundraiserId: string,
  cellIndex: number,
  donorName: string
): Promise<SquareRecord | null> {
  if (!TableName) return null;
  const key = marshall({ PK: pkFundraiser(fundraiserId), SK: skSquare(cellIndex) });
  const res = await client.send(
    new UpdateItemCommand({
      TableName,
      Key: key,
      ConditionExpression: "#status = :available",
      UpdateExpression: "SET #status = :pending, donorName = :name",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: marshall({ ":available": "available", ":pending": "pending", ":name": donorName }),
      ReturnValues: "ALL_NEW",
    })
  );
  return res.Attributes ? (unmarshall(res.Attributes) as SquareRecord) : null;
}

export async function confirmSquare(fundraiserId: string, cellIndex: number): Promise<SquareRecord | null> {
  if (!TableName) return null;
  const now = new Date().toISOString();
  const res = await client.send(
    new UpdateItemCommand({
      TableName,
      Key: marshall({ PK: pkFundraiser(fundraiserId), SK: skSquare(cellIndex) }),
      ConditionExpression: "#status = :pending",
      UpdateExpression: "SET #status = :claimed, claimedAt = :now",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: marshall({ ":pending": "pending", ":claimed": "claimed", ":now": now }),
      ReturnValues: "ALL_NEW",
    })
  );
  return res.Attributes ? (unmarshall(res.Attributes) as SquareRecord) : null;
}

export async function releaseSquare(fundraiserId: string, cellIndex: number): Promise<SquareRecord | null> {
  if (!TableName) return null;
  const res = await client.send(
    new UpdateItemCommand({
      TableName,
      Key: marshall({ PK: pkFundraiser(fundraiserId), SK: skSquare(cellIndex) }),
      ConditionExpression: "#status = :pending",
      UpdateExpression: "SET #status = :available REMOVE donorName",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: marshall({ ":pending": "pending", ":available": "available" }),
      ReturnValues: "ALL_NEW",
    })
  );
  return res.Attributes ? (unmarshall(res.Attributes) as SquareRecord) : null;
}

export async function updateFundraiserPhoto(fundraiserId: string, dancerPhotoS3Key: string): Promise<void> {
  if (!TableName) return;
  await client.send(
    new UpdateItemCommand({
      TableName,
      Key: marshall({ PK: pkFundraiser(fundraiserId), SK: "META" }),
      UpdateExpression: "SET dancerPhotoS3Key = :key",
      ExpressionAttributeValues: marshall({ ":key": dancerPhotoS3Key }),
    })
  );
}


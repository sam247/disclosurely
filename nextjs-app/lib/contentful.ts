import { createClient, type EntryCollection } from "contentful";

const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const token = process.env.CONTENTFUL_DELIVERY_TOKEN;

function assertEnv() {
  if (!space || !token) {
    throw new Error(
      "Missing Contentful env vars: NEXT_PUBLIC_CONTENTFUL_SPACE_ID and CONTENTFUL_DELIVERY_TOKEN"
    );
  }
}

export function createContentfulClient() {
  assertEnv();
  return createClient({
    space,
    accessToken: token
  });
}

export async function fetchEntries<T>(query: Record<string, unknown>) {
  const client = createContentfulClient();
  const response: EntryCollection<T> = await client.getEntries<T>(query);
  return response.items;
}


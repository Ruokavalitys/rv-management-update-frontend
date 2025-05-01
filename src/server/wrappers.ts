"use server";

import { auth } from "@/auth";

export async function authenticated<TResponse>(
url: string,
config: RequestInit = {},
body?: Record<string, unknown>,
): Promise<TResponse> {
const session = await auth();
if (!session?.user) {
throw new Error("Not authenticated");
}

const method = config.method?.toUpperCase() || "GET";

const cleanedConfig: RequestInit = {
...config,
next: config.next
? {
...config.next,
tags: Array.isArray(config.next.tags)
? config.next.tags.filter((tag) => typeof tag === "string")
: undefined,
}
: undefined,
};

const responseOptions: RequestInit = {
...cleanedConfig,
headers: {
Authorization: `Bearer ${session.user.accessToken}`,
"Content-Type": "application/json",
...(config.headers || {}),
},
};

if (method !== "GET" && method !== "HEAD" && body) {
responseOptions.body = JSON.stringify(body);
}

const response = await fetch(url, responseOptions);

if (!response.ok) {
throw new Error(`Request failed: ${response.statusText}`);
}

const contentType = response.headers.get("Content-Type");

if (contentType?.includes("application/json")) {
const data = await response.json();
return data as TResponse;
}

if (contentType?.includes("text/plain")) {
const data = await response.text();
return data as TResponse;
}

try {
const text = await response.text();
if (!text) {
return { success: true } as TResponse;
}
const data = JSON.parse(text);
return data as TResponse;
} catch (error) {
throw new Error("Unsupported content type or invalid response format");
}
}
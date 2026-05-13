"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }
}

const SINGLETON_ID = "singleton";

export interface LandingTheme {
  pageBg: string;
  headerBg: string;
  headerText: string;
  heroBg: string;
  heroText: string;
  heroSubtext: string;
  buttonBg: string;
  buttonText: string;
  footerBg: string;
  footerText: string;
  footerBorder: string;
  bgPattern: string;
}

export const DEFAULT_THEME: LandingTheme = {
  pageBg: "#fafaf9",
  headerBg: "#ffffff",
  headerText: "#18181b",
  heroBg: "#18181b",
  heroText: "#ffffff",
  heroSubtext: "#d4d4d8",
  buttonBg: "#18181b",
  buttonText: "#ffffff",
  footerBg: "#ffffff",
  footerText: "#71717a",
  footerBorder: "#e4e4e7",
  bgPattern: "none",
};

export function parseTheme(raw: string): LandingTheme {
  try {
    const parsed = JSON.parse(raw) as Partial<LandingTheme>;
    return { ...DEFAULT_THEME, ...parsed };
  } catch {
    return { ...DEFAULT_THEME };
  }
}

export async function getLandingContent(): Promise<{
  html: string;
  theme: LandingTheme;
}> {
  const row = await db.landingContent.findUnique({
    where: { id: SINGLETON_ID },
  });
  return {
    html: row?.html ?? "",
    theme: parseTheme(row?.theme ?? "{}"),
  };
}

export async function saveLandingContent(html: string) {
  await requireAuth();
  await db.landingContent.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, html },
    update: { html },
  });
  revalidatePath("/site");
}

export async function saveLandingTheme(theme: LandingTheme) {
  await requireAuth();
  await db.landingContent.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, theme: JSON.stringify(theme) },
    update: { theme: JSON.stringify(theme) },
  });
  revalidatePath("/site");
}

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface LinkedInProfileResult {
  ok: boolean;
  url: string;
  name: string;
  headline: string;
  summary: string;
}

const MAX_HOPS = 3;

function isLinkedInHost(hostname: string) {
  return hostname === "linkedin.com" || hostname.endsWith(".linkedin.com");
}

// Accepts "linkedin.com/in/jane" as well as a full URL; returns null for
// anything that isn't a LinkedIn personal-profile link.
export function normalizeLinkedInUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    if (url.protocol !== "https:" || !isLinkedInHost(url.hostname)) return null;
    if (!/^\/in\/[^/]+/i.test(url.pathname)) return null;
    return `https://www.linkedin.com${url.pathname.replace(/\/+$/, "")}`;
  } catch {
    return null;
  }
}

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)));
}

function metaContent(html: string, property: string) {
  const re = new RegExp(`<meta[^>]+property="${property}"[^>]+content="([^"]*)"`, "i");
  const match = html.match(re);
  return match?.[1] ? decodeEntities(match[1]).trim() : "";
}

// Best-effort only: a public profile exposes its headline and a short summary
// in page metadata, which is all we read. Private profiles, login walls and
// LinkedIn blocking server traffic all return ok:false, and the caller falls
// back to asking the visitor to describe their background instead.
export const fetchLinkedInProfile = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ url: z.string().min(1).max(300) }).parse(data))
  .handler(async ({ data }): Promise<LinkedInProfileResult> => {
    const url = normalizeLinkedInUrl(data.url);
    const empty = { ok: false, url: url ?? data.url.trim(), name: "", headline: "", summary: "" };
    if (!url) return empty;

    try {
      let target = url;
      let html = "";
      for (let hop = 0; hop <= MAX_HOPS; hop++) {
        const res = await fetch(target, {
          redirect: "manual",
          signal: AbortSignal.timeout(8000),
          headers: {
            "user-agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
            "accept-language": "en-US,en;q=0.9",
          },
        });
        if (res.status >= 300 && res.status < 400) {
          const location = res.headers.get("location");
          if (!location) return empty;
          const next = new URL(location, target);
          if (next.protocol !== "https:" || !isLinkedInHost(next.hostname)) return empty;
          target = next.toString();
          continue;
        }
        if (!res.ok) return empty;
        html = await res.text();
        break;
      }
      if (!html) return empty;

      if (metaContent(html, "og:type") !== "profile") return empty;
      const title = metaContent(html, "og:title").replace(/\s*\|\s*LinkedIn\s*$/i, "");
      const separator = title.indexOf(" - ");
      const name = separator > 0 ? title.slice(0, separator).trim() : title;
      const headline = separator > 0 ? title.slice(separator + 3).trim() : "";
      const summary = metaContent(html, "og:description").slice(0, 1200);
      if (!headline && !summary) return empty;

      return { ok: true, url, name, headline, summary };
    } catch {
      return empty;
    }
  });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function gitlabPagesBase(): string {
  const explicit = process.env.VITE_BASE_PATH;
  if (explicit) {
    return explicit.endsWith("/") ? explicit : `${explicit}/`;
  }

  const pagesUrl = process.env.CI_PAGES_URL;
  if (!pagesUrl) return "/";

  try {
    const pathname = new URL(pagesUrl).pathname;
    if (!pathname || pathname === "/") return "/";
    return pathname.endsWith("/") ? pathname : `${pathname}/`;
  } catch {
    return "/";
  }
}

export default defineConfig({
  plugins: [react()],
  base: gitlabPagesBase(),
});

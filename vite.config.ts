import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function pagesBase(): string {
  const explicit = process.env.VITE_BASE_PATH;
  if (explicit) {
    return explicit.endsWith("/") ? explicit : `${explicit}/`;
  }

  // GitHub Actions project Pages: https://<user>.github.io/<repo>/
  if (process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_REPOSITORY) {
    const repo = process.env.GITHUB_REPOSITORY.split("/")[1];
    return `/${repo}/`;
  }

  // GitLab Pages
  const pagesUrl = process.env.CI_PAGES_URL;
  if (pagesUrl) {
    try {
      const pathname = new URL(pagesUrl).pathname;
      if (!pathname || pathname === "/") return "/";
      return pathname.endsWith("/") ? pathname : `${pathname}/`;
    } catch {
      return "/";
    }
  }

  return "/";
}

export default defineConfig({
  plugins: [react()],
  base: pagesBase(),
  // Static assets (favicon, etc.). Keep off "public" so CI Pages can use that name.
  publicDir: "static",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});

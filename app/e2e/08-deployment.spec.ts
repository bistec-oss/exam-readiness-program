import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../../");

test.describe("08 - Docker + Caddy + Cloudflare Deployment", () => {
  test("Dockerfile exists in app directory", () => {
    const dockerfilePath = path.join(ROOT, "app", "Dockerfile");
    expect(fs.existsSync(dockerfilePath)).toBe(true);
  });

  test("Dockerfile uses multi-stage build", () => {
    const content = fs.readFileSync(path.join(ROOT, "app", "Dockerfile"), "utf-8");
    const fromCount = (content.match(/^FROM /gm) ?? []).length;
    expect(fromCount).toBeGreaterThanOrEqual(2);
  });

  test("Dockerfile uses node:20-alpine base", () => {
    const content = fs.readFileSync(path.join(ROOT, "app", "Dockerfile"), "utf-8");
    expect(content).toContain("node:20-alpine");
  });

  test("docker-compose.yml exists at project root", () => {
    expect(fs.existsSync(path.join(ROOT, "docker-compose.yml"))).toBe(true);
  });

  test("docker-compose.yml defines required services", () => {
    const content = fs.readFileSync(path.join(ROOT, "docker-compose.yml"), "utf-8");
    expect(content).toContain("app:");
    expect(content).toContain("db:");
    expect(content).toContain("caddy:");
    expect(content).toContain("cloudflared:");
  });

  test("docker-compose.yml has postgres health check", () => {
    const content = fs.readFileSync(path.join(ROOT, "docker-compose.yml"), "utf-8");
    expect(content).toContain("healthcheck:");
    expect(content).toContain("pg_isready");
  });

  test("Caddyfile exists at project root", () => {
    expect(fs.existsSync(path.join(ROOT, "Caddyfile"))).toBe(true);
  });

  test("Caddyfile reverse-proxies to app", () => {
    const content = fs.readFileSync(path.join(ROOT, "Caddyfile"), "utf-8");
    expect(content).toContain("reverse_proxy");
    expect(content).toContain("app:");
  });

  test(".env.example exists at project root", () => {
    expect(fs.existsSync(path.join(ROOT, ".env.example"))).toBe(true);
  });

  test(".env.example contains required variables", () => {
    const content = fs.readFileSync(path.join(ROOT, ".env.example"), "utf-8");
    expect(content).toContain("POSTGRES_PASSWORD");
    expect(content).toContain("SESSION_SECRET");
    expect(content).toContain("CLOUDFLARE_TUNNEL_TOKEN");
    expect(content).toContain("DATABASE_URL");
  });

  test("README.md exists at project root", () => {
    expect(fs.existsSync(path.join(ROOT, "README.md"))).toBe(true);
  });

  test("README.md documents deployment steps", () => {
    const content = fs.readFileSync(path.join(ROOT, "README.md"), "utf-8");
    expect(content).toContain("docker compose");
    expect(content).toContain("Cloudflare");
    expect(content).toContain("SESSION_SECRET");
  });

  test("app is reachable and returns 200", async ({ request }) => {
    const res = await request.get("/");
    expect(res.status()).toBe(200);
  });

  test("app serves correct content-type for HTML", async ({ request }) => {
    const res = await request.get("/login");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/html");
  });
});

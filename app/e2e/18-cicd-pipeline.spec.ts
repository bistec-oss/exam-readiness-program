import { test, expect } from "@playwright/test";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Playwright runs with cwd = app/, so the workflow lives one level up.
const WORKFLOW = resolve(process.cwd(), "..", ".github", "workflows", "ci-cd.yml");

test.describe("18 - CI/CD Pipeline", () => {
  test("workflow file exists", () => {
    expect(existsSync(WORKFLOW)).toBe(true);
  });

  test("workflow triggers on push and PR to main", () => {
    const yml = readFileSync(WORKFLOW, "utf8");
    expect(yml).toMatch(/on:/);
    expect(yml).toMatch(/push:/);
    expect(yml).toMatch(/pull_request:/);
    expect(yml).toMatch(/branches:\s*\[main\]/);
  });

  test("defines build-test, docker and deploy jobs in order", () => {
    const yml = readFileSync(WORKFLOW, "utf8");
    expect(yml).toMatch(/^\s{2}build-test:/m);
    expect(yml).toMatch(/^\s{2}docker:/m);
    expect(yml).toMatch(/^\s{2}deploy:/m);
    // gating: docker needs build-test, deploy needs docker
    expect(yml).toMatch(/needs:\s*build-test/);
    expect(yml).toMatch(/needs:\s*docker/);
  });

  test("build-test runs lint, build and e2e", () => {
    const yml = readFileSync(WORKFLOW, "utf8");
    expect(yml).toMatch(/npm run lint/);
    expect(yml).toMatch(/npm run build/);
    expect(yml).toMatch(/npm run test:e2e/);
    expect(yml).toMatch(/prisma migrate deploy/);
  });

  test("docker job builds and pushes to Docker Hub using secrets", () => {
    const yml = readFileSync(WORKFLOW, "utf8");
    expect(yml).toMatch(/docker\/login-action/);
    expect(yml).toMatch(/docker\/build-push-action/);
    expect(yml).toMatch(/secrets\.DOCKERHUB_USERNAME/);
    expect(yml).toMatch(/secrets\.DOCKERHUB_TOKEN/);
    expect(yml).toMatch(/push:\s*true/);
  });

  test("deploy job ssh-deploys to the self-hosted host on main push only", () => {
    const yml = readFileSync(WORKFLOW, "utf8");
    expect(yml).toMatch(/ssh-action/);
    expect(yml).toMatch(/secrets\.DEPLOY_HOST/);
    expect(yml).toMatch(/secrets\.DEPLOY_SSH_KEY/);
    expect(yml).toMatch(/docker compose pull/);
    expect(yml).toMatch(/github\.ref == 'refs\/heads\/main'/);
  });
});

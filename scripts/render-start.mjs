import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const cwd = process.cwd();
const prismaCliPath = path.join(cwd, "node_modules", "prisma", "build", "index.js");
const nextCliPath = path.join(cwd, "node_modules", "next", "dist", "bin", "next");

let activeChild = null;

function resolveDatabaseUrl() {
  return process.env.DATABASE_URL?.trim() || "file:./data/dev.db";
}

async function ensureRuntimeDirectories(databaseUrl) {
  await mkdir(path.join(cwd, "public", "uploads"), { recursive: true });

  if (!databaseUrl.startsWith("file:")) {
    return;
  }

  const filePath = databaseUrl.slice("file:".length);
  if (!filePath || filePath === ":memory:") {
    return;
  }

  const absoluteFilePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(cwd, filePath);

  await mkdir(path.dirname(absoluteFilePath), { recursive: true });
}

function runCommand(command, args, label) {
  return new Promise((resolve, reject) => {
    console.log(`\n==> ${label}`);

    const child = spawn(command, args, {
      cwd,
      env: process.env,
      stdio: "inherit",
    });

    activeChild = child;

    child.on("error", reject);
    child.on("exit", (code) => {
      activeChild = null;

      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${label} failed with exit code ${code ?? "unknown"}`));
    });
  });
}

function forwardSignal(signal) {
  if (activeChild) {
    activeChild.kill(signal);
  }
}

process.on("SIGINT", () => forwardSignal("SIGINT"));
process.on("SIGTERM", () => forwardSignal("SIGTERM"));

async function main() {
  process.env.DATABASE_URL = resolveDatabaseUrl();

  await ensureRuntimeDirectories(process.env.DATABASE_URL);
  await runCommand(process.execPath, [prismaCliPath, "migrate", "deploy"], "Applying Prisma migrations");
  await runCommand(process.execPath, [path.join(cwd, "prisma", "seed.js")], "Seeding database");

  const port = process.env.PORT?.trim() || "3000";

  console.log(`\n==> Starting Next.js on port ${port}`);
  activeChild = spawn(
    process.execPath,
    [nextCliPath, "start", "--hostname", "0.0.0.0", "--port", port],
    {
      cwd,
      env: process.env,
      stdio: "inherit",
    }
  );

  activeChild.on("error", (error) => {
    console.error(error);
    process.exit(1);
  });

  activeChild.on("exit", (code) => {
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
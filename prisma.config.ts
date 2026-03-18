import path from "node:path"
import { defineConfig } from "prisma/config"
import Database from "better-sqlite3"

export default defineConfig({
  earlyAccess: true,
  schema: "prisma/schema.prisma",
  migrate: {
    async adapter(env) {
      const { PrismaBetterSqlite3 } = await import("@prisma/adapter-better-sqlite3")
      const url = env["DATABASE_URL"] ?? `file:${path.join(process.cwd(), "prisma/dev.db")}`
      const dbPath = url.replace("file:", "")
      const db = new Database(dbPath)
      return new PrismaBetterSqlite3(db)
    },
  },
})

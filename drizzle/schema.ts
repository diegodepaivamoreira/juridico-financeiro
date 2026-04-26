import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// JurisFinance tables
export const lancamentos = mysqlTable("lancamentos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  data: varchar("data", { length: 10 }).notNull(),
  // Autores (até 2)
  autor1: varchar("autor1", { length: 255 }).notNull(),
  autor2: varchar("autor2", { length: 255 }),
  // Réus (até 3)
  reu1: varchar("reu1", { length: 255 }).notNull(),
  reu2: varchar("reu2", { length: 255 }),
  reu3: varchar("reu3", { length: 255 }),
  processo: varchar("processo", { length: 255 }),
  tipo: varchar("tipo", { length: 50 }).notNull(),
  valor: int("valor").notNull(), // Stored in centavos
  banco: varchar("banco", { length: 50 }).notNull(),
  mes: int("mes").notNull(),
  ano: int("ano").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lancamento = typeof lancamentos.$inferSelect;
export type InsertLancamento = typeof lancamentos.$inferInsert;

export const aReceber = mysqlTable("aReceber", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Autores (até 2)
  autor1: varchar("autor1", { length: 255 }).notNull(),
  autor2: varchar("autor2", { length: 255 }),
  // Réus (até 3)
  reu1: varchar("reu1", { length: 255 }).notNull(),
  reu2: varchar("reu2", { length: 255 }),
  reu3: varchar("reu3", { length: 255 }),
  tipo: varchar("tipo", { length: 50 }).notNull(),
  valor: int("valor"), // Stored em centavos, nullable
  status: mysqlEnum("status", ["Pendente", "Recebido"]).default("Pendente").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ItemAReceber = typeof aReceber.$inferSelect;
export type InsertItemAReceber = typeof aReceber.$inferInsert;
import { pgTable, text, serial, integer, json, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema from the original file
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// AI Model Wrapper schema
export const wrappers = pgTable("wrappers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  baseModel: text("base_model").notNull(),
  systemPrompt: text("system_prompt"),
  temperature: integer("temperature").default(70), // Store as integer 0-100 for easy slider
  maxTokens: integer("max_tokens").default(2048),
  topP: integer("top_p").default(90), // Store as integer 0-100
  enableMemory: boolean("enable_memory").default(true),
  knowledgeBaseIntegration: boolean("knowledge_base_integration").default(false),
  webSearchAccess: boolean("web_search_access").default(false),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWrapperSchema = createInsertSchema(wrappers).omit({
  id: true,
  createdAt: true,
});

export type InsertWrapper = z.infer<typeof insertWrapperSchema>;
export type Wrapper = typeof wrappers.$inferSelect;

// Custom Prompts schema
export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  description: text("description"),
  wrapperId: integer("wrapper_id").notNull(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPromptSchema = createInsertSchema(prompts).omit({
  id: true,
  createdAt: true,
});

export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Prompt = typeof prompts.$inferSelect;

// Integration schema for external tools/APIs
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // e.g., "api", "database", "knowledge_base"
  config: json("config").notNull(), // Store connection details as JSON
  wrapperId: integer("wrapper_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertIntegrationSchema = createInsertSchema(integrations).omit({
  id: true,
  createdAt: true,
});

export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type Integration = typeof integrations.$inferSelect;

// Conversation history schema
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  wrapperId: integer("wrapper_id").notNull(),
  messages: json("messages").notNull(), // Array of message objects with role, content
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

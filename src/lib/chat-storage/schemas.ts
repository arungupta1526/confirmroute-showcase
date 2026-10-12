import { z } from "zod";
import { DEFAULT_MODEL_ID } from "../models.js";

export const StoredMessageUsageSchema = z.object({
  prompt: z.number().optional(),
  completion: z.number().optional(),
  total: z.number().optional(),
}).optional();

export const StoredMessageCostSchema = z.object({
  amountInr: z.number().optional(),
  amountUsd: z.number().optional(),
  formattedInr: z.string().optional(),
  formattedUsd: z.string().optional(),
  isFreeTier: z.boolean().optional(),
}).optional();

// H3: Stored Message Zod Schema — Rejects injected "system" role from client storage to prevent prompt manipulation
export const StoredMessageSchema = z.object({
  id: z.string().default(() => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `msg_${Date.now()}`)),
  role: z.enum(["user", "assistant", "system"]).transform((val) => (val === "system" ? "assistant" : val)),
  content: z.string().max(50000).default(""),
  parts: z.array(z.any()).optional(),
  createdAt: z.union([z.string(), z.number(), z.date()]).optional(),
  modelName: z.string().optional(),
  modelId: z.string().optional(),
  timestamp: z.number().optional(),
  roleType: z.enum(["fast", "workhorse", "reasoning"]).optional(),
  tokens: StoredMessageUsageSchema,
  cost: StoredMessageCostSchema,
  toolInvocations: z.array(z.any()).optional(),
  annotations: z.array(z.any()).optional(),
  selectedSuggestion: z.string().nullable().optional(),
}).passthrough();

// H3: Stored Session Zod Schema
export const StoredSessionSchema = z.object({
  id: z.string().min(1),
  title: z.string().max(200).default("Train Query"),
  createdAt: z.number().default(() => Date.now()),
  updatedAt: z.number().default(() => Date.now()),
  modelId: z.string().default(DEFAULT_MODEL_ID),
  messages: z.array(StoredMessageSchema).default([]),
  selectedSuggestionsMap: z.record(z.string(), z.string()).optional(),
});

export const StoredSessionsArraySchema = z.array(StoredSessionSchema);

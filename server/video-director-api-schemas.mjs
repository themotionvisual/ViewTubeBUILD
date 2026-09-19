import { z } from "zod";

const GenerationRequestSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: z.string().trim().min(1),
  shotId: z.string().trim().min(1).optional(),
  variantId: z.string().trim().min(1).optional(),
  providerId: z.string().trim().min(1),
  modelId: z.string().trim().min(1),
  durationSeconds: z.number().min(0.1).max(3_600),
  aspectRatio: z.string().trim().min(1).max(32),
  resolution: z.string().trim().min(1).max(32),
  outputCount: z.number().int().min(1).max(24),
  nativeAudio: z.boolean(),
  seed: z.number().int().min(0).max(2_147_483_647).nullable(),
  startFrameAssetId: z.string().trim().min(1).optional(),
  endFrameAssetId: z.string().trim().min(1).optional(),
  referenceAssetIds: z.array(z.string().trim().min(1)).max(64).default([]),
  negativeConstraints: z.array(z.string().trim().min(1)).max(512).default([]),
  compiledPrompt: z.string().max(100_000).default(""),
  providerParameters: z.record(z.string(), z.unknown()).default({}),
}).strict();

export const VideoDirectorJobSubmitSchema = z.object({
  projectId: z.string().trim().min(1),
  shotId: z.string().trim().min(1).optional(),
  variantId: z.string().trim().min(1).optional(),
  idempotencyKey: z.string().trim().min(16).max(256),
  priority: z.number().int().min(-100).max(100).default(0),
  maxAttempts: z.number().int().min(1).max(10).default(3),
  estimatedCredits: z.number().min(0).nullable().default(null),
  providerId: z.string().trim().min(1).optional(),
  modelId: z.string().trim().min(1).optional(),
  providerPlan: z.record(z.string(), z.unknown()).default({}),
  request: GenerationRequestSchema,
}).strict().superRefine((value, ctx) => {
  if (value.projectId !== value.request.projectId) {
    ctx.addIssue({
      code: "custom",
      message: "projectId must match request.projectId",
      path: ["projectId"],
    });
  }
  if ((value.shotId || undefined) !== (value.request.shotId || undefined)) {
    ctx.addIssue({
      code: "custom",
      message: "shotId must match request.shotId",
      path: ["shotId"],
    });
  }
  if ((value.variantId || undefined) !== (value.request.variantId || undefined)) {
    ctx.addIssue({
      code: "custom",
      message: "variantId must match request.variantId",
      path: ["variantId"],
    });
  }
});

export const parseVideoDirectorJobSubmit = (value) =>
  VideoDirectorJobSubmitSchema.parse(value);

export const formatZodIssues = (error) =>
  error?.issues?.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  })) || [];

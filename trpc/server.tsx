import "server-only";

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";
import { createCallerFactory, createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import type { AppRouter } from "./router";
import { appRouter } from "./router";

export const getQueryClient = cache(makeQueryClient);

const caller = createCallerFactory(appRouter);

export const { trpc, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller(createTRPCContext),
  getQueryClient,
);

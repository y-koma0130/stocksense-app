import { createServerClient } from "@supabase/ssr";
import { initTRPC, TRPCError } from "@trpc/server";
import { cookies } from "next/headers";
import { cache } from "react";
import superjson from "superjson";

/**
 * Create tRPC context with optional Supabase authentication
 * This context is available in all tRPC procedures
 */
export const createTRPCContext = cache(async () => {
  const cookieStore = await cookies();

  // Create Supabase client for authentication (optional for public procedures)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // setAll called from Server Component - can be ignored
          }
        },
      },
    },
  );

  // Get user (will be null if not authenticated)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    supabase,
    user,
  };
});

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

export const authenticatedProcedure = t.procedure.use(async (opts) => {
  if (!opts.ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return opts.next({
    ctx: {
      ...opts.ctx,
      user: opts.ctx.user,
    },
  });
});

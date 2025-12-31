import { defineMiddleware } from "astro/middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./lib/types";

export const onRequest = defineMiddleware(async (context, next) => {
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || import.meta.env.SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error("[Middleware] Missing Supabase env vars. URL:", !!supabaseUrl, "Key:", !!supabaseAnonKey);
    }

    // Fallback to prevent crash
    const supabase = createClient<Database>(
        supabaseUrl || 'https://placeholder.supabase.co',
        supabaseAnonKey || 'placeholder',
        {
            auth: {
                flowType: 'pkce',
                detectSessionInUrl: false,
                persistSession: false,
            },
        }
    );

    const accessToken = context.cookies.get("sb-access-token");
    const refreshToken = context.cookies.get("sb-refresh-token");

    console.log(`[Middleware] Path: ${context.url.pathname}, Has Access Token: ${!!accessToken}, Has Refresh Token: ${!!refreshToken}`);

    if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
            access_token: accessToken.value,
            refresh_token: refreshToken.value,
        });

        if (error) {
            console.error("[Middleware] Auth setSession Error:", error.message);
            context.cookies.delete("sb-access-token", { path: "/" });
            context.cookies.delete("sb-refresh-token", { path: "/" });
        } else if (data.user) {
            console.log("[Middleware] Auth Success. User ID:", data.user.id);
            context.locals.user = data.user;

            // Fetch profile for role-based access
            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", data.user.id)
                .single();

            if (profile) {
                context.locals.profile = profile;
            }
        }
    }

    // Protected Routes Logic
    const protectedRoutes = ["/dashboard"];
    const isProtectedRoute = protectedRoutes.some((route) =>
        context.url.pathname.startsWith(route)
    );

    if (isProtectedRoute && !context.locals.user) {
        return context.redirect("/auth/signin");
    }

    if (context.url.pathname === "/auth/signin" && context.locals.user) {
        return context.redirect("/dashboard");
    }

    return next();
});

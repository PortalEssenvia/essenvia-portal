// Edge function multi-ação para o painel /admin.
// Verifica role 'admin' via has_role e usa service role para acessar auth.users
// e tabelas administrativas (modules, plan_permissions, admin_logs, profiles).
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimErr } = await userClient.auth.getClaims(token);
    if (claimErr || !claims?.claims) return json({ error: "Unauthorized" }, 401);
    const callerId = claims.claims.sub as string;

    const admin = createClient(SUPABASE_URL, SERVICE);

    // verifica papel admin
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const action = body?.action as string;

    const logAction = async (
      a: string,
      target_user_id: string | null,
      details: Record<string, unknown> = {},
    ) => {
      await admin.from("admin_logs").insert({
        action: a,
        target_user_id,
        performed_by: callerId,
        details,
      });
    };

    switch (action) {
      case "list_users": {
        // métricas + lista de perfis com emails de auth.users
        const { data: profiles } = await admin
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        const ids = (profiles ?? []).map((p: any) => p.id);
        const emailMap = new Map<string, string>();
        // paginar auth.users
        let page = 1;
        while (true) {
          const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
          if (error) break;
          (data.users ?? []).forEach((u) => emailMap.set(u.id, u.email ?? ""));
          if (!data.users || data.users.length < 200) break;
          page++;
          if (page > 50) break;
        }

        const users = (profiles ?? []).map((p: any) => ({
          ...p,
          email: emailMap.get(p.id) ?? "",
        }));

        const total = users.length;
        const pending = users.filter((u) => u.status === "pending").length;
        const overdue = users.filter((u) => u.payment_status === "overdue").length;
        const activePaid = users.filter((u) => u.status === "active" && u.plan && u.plan !== "free").length;

        return json({ users, metrics: { total, pending, overdue, activePaid } });
      }

      case "update_user": {
        const { user_id, patch } = body;
        if (!user_id || !patch) return json({ error: "Missing fields" }, 400);
        const allowed: Record<string, unknown> = {};
        for (const k of ["full_name", "status", "plan", "payment_status", "access_modules", "notes"]) {
          if (k in patch) allowed[k] = patch[k];
        }
        const { error } = await admin.from("profiles").update(allowed).eq("id", user_id);
        if (error) return json({ error: error.message }, 400);
        await logAction("update_user", user_id, allowed);
        return json({ ok: true });
      }

      case "set_status": {
        const { user_id, status } = body;
        const { error } = await admin.from("profiles").update({ status }).eq("id", user_id);
        if (error) return json({ error: error.message }, 400);
        await logAction(`status:${status}`, user_id, {});
        return json({ ok: true });
      }

      case "list_modules": {
        const { data } = await admin.from("modules").select("*").order("created_at", { ascending: true });
        return json({ modules: data ?? [] });
      }

      case "upsert_module": {
        const { module } = body;
        if (!module?.slug || !module?.name) return json({ error: "Missing fields" }, 400);
        const { data, error } = await admin.from("modules").upsert(module, { onConflict: "slug" }).select().single();
        if (error) return json({ error: error.message }, 400);
        await logAction("module:upsert", null, { slug: module.slug });
        return json({ module: data });
      }

      case "toggle_module": {
        const { id, is_active } = body;
        const { error } = await admin.from("modules").update({ is_active }).eq("id", id);
        if (error) return json({ error: error.message }, 400);
        await logAction(`module:${is_active ? "enable" : "disable"}`, null, { id });
        return json({ ok: true });
      }

      case "list_plan_permissions": {
        const { data } = await admin.from("plan_permissions").select("*");
        return json({ permissions: data ?? [] });
      }

      case "set_plan_permission": {
        const { plan, module_slug, allowed } = body;
        const { error } = await admin
          .from("plan_permissions")
          .upsert({ plan, module_slug, allowed }, { onConflict: "plan,module_slug" });
        if (error) return json({ error: error.message }, 400);
        await logAction("plan_permission:set", null, { plan, module_slug, allowed });
        return json({ ok: true });
      }

      case "list_logs": {
        const { data } = await admin
          .from("admin_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500);
        return json({ logs: data ?? [] });
      }

      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (e) {
    console.error("[admin-api] erro:", e);
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
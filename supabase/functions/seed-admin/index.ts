// Bootstrap only through the managed internal credential; never reset an existing password.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { authenticateCronRequest } from "../_shared/cron-auth.ts";

const ADMIN_EMAIL = "zx.piham_47@gmail.com";
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405);
  const denied = authenticateCronRequest(req);
  if (denied) return json({ error: "Non autorisé" }, denied.status);
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const password = Deno.env.get("PIHAM_ADMIN_PASSWORD");
    if (!url || !service || !password) return json({ error: "Configuration incomplète" }, 500);
    const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
    let userId: string | undefined;
    for (let page = 1; page <= 50; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      userId = data.users.find((user) => user.email?.toLowerCase() === ADMIN_EMAIL)?.id;
      if (userId || data.users.length < 200) break;
      if (page === 50) throw new Error("Recherche incomplète");
    }
    const created = !userId;
    if (!userId) {
      const { data, error } = await admin.auth.admin.createUser({
        email: ADMIN_EMAIL, password, email_confirm: true, user_metadata: { full_name: "Super Admin" },
      });
      if (error) throw error;
      userId = data.user?.id;
    }
    if (!userId) throw new Error("Compte introuvable");
    for (const role of ["super_admin", "admin"] as const) {
      const { error } = await admin.from("user_roles").upsert({ user_id: userId, role }, { onConflict: "user_id,role" });
      if (error) throw error;
    }
    const { error } = await admin.from("profiles").upsert({ id: userId, full_name: "Super Admin" }, { onConflict: "id" });
    if (error) throw error;
    return json({ ok: true, created, user_id: userId });
  } catch {
    return json({ ok: false, error: "La restauration du compte a échoué" }, 500);
  }
});

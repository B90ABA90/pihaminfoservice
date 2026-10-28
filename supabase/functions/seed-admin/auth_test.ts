import { authenticateCronRequest } from "../_shared/cron-auth.ts";

Deno.test("admin bootstrap rejects a request without authentication", () => {
  const result = authenticateCronRequest(new Request("http://localhost/seed-admin", { method: "POST" }));
  if (!result || (result.status !== 401 && result.status !== 500)) throw new Error("Unauthenticated bootstrap must be denied");
});

Deno.test("admin bootstrap rejects a public bearer credential", () => {
  const result = authenticateCronRequest(new Request("http://localhost/seed-admin", {
    method: "POST", headers: { Authorization: "Bearer public-test-credential" },
  }));
  if (!result || (result.status !== 401 && result.status !== 500)) throw new Error("Public credential must be denied");
});
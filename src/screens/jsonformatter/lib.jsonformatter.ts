import { err, ok, Result } from "@/lib/result";

export function parseJSON(text: string): Result<unknown, null> | Result<null, string> {
  try { return ok(JSON.parse(text)); }
  catch (e) { return err((e as Error).message); }
}


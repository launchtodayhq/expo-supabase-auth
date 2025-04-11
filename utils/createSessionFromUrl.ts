import { supabase } from "@/services";
import { Session } from "@supabase/supabase-js";
import * as QueryParams from "expo-auth-session/build/QueryParams";

export async function createSessionFromUrl(
  url: string
): Promise<Session | null | undefined> {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    const message = `createSessionFromUrl() - error - error getting query params from url - ${errorCode}`;
    throw new Error(message);
  }

  const { code } = params;

  if (!code) {
    console.info(
      "createSessionFromUrl() - authorization code not found in URL parameters"
    );
    return null;
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error(
      "createSessionFromUrl() - error exchanging code for session:",
      error
    );
    throw error;
  }

  return data.session;
}

import type { UploadOptions } from "tus-js-client";

type UploadSession = { user: { id: string }; access_token: string };

export function uploadAuthorization(
  owner: string,
  publishableKey: string,
  getSession: () => Promise<{ data: { session: UploadSession | null } }>,
): Pick<UploadOptions, "headers" | "onBeforeRequest"> {
  return {
    headers: { apikey: publishableKey },
    onBeforeRequest: async (req) => {
      const { data: { session } } = await getSession();
      if (!session || session.user.id !== owner)
        throw new Error("The signed-in account changed.");
      // XHR appends repeated headers. Set authorization only here so every
      // request has one fresh Bearer token, including retries and resumes.
      req.setHeader("authorization", `Bearer ${session.access_token}`);
    },
  };
}

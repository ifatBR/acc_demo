import { AUTODESK_BASIC_URL, AUTODEKS_APIS } from "../../apis/autodeskApis";
let apsToken: { value: string; expiresAt: number } | null = null;
let tokenPromise: Promise<string> | null = null;

export async function requestApsToken(scope?: string[]) {
  const basic = Buffer.from(
    `${process.env.APS_CLIENT_ID}:${process.env.APS_CLIENT_SECRET}`,
  ).toString("base64");

  let res: Response;
  try {
    res = await fetch(`${AUTODESK_BASIC_URL}${AUTODEKS_APIS.getToken}`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
        region: "EMEA",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope:
          scope?.join(" ") ||
          "data:read data:write data:create bucket:create bucket:read",
      }),
    });
  } catch (err) {
    throw new Error(`Network error requesting APS token: ${(err as Error).message}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`APS token request failed: ${res.status} ${res.statusText}${body ? ` — ${body}` : ""}`);
  }

  return res.json();
}

export async function getApsToken() {
  if (apsToken && Date.now() < apsToken.expiresAt) {
    return apsToken.value;
  }

  if (!tokenPromise) {
    tokenPromise = requestApsToken().then((data) => {
      apsToken = {
        value: data.access_token,
        expiresAt: Date.now() + (data.expires_in - 60) * 1000,
      };
      tokenPromise = null;
      return apsToken.value;
    });
  }

  return tokenPromise;
}

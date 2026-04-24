import { getApsToken } from "@modules/auth/auth.service";
import { AUTODEKS_APIS, AUTODESK_BASIC_URL } from "../../apis/autodeskApis";
import { uploadFile } from "@modules/bucket/bucket.service";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function translateObject(objectId: string) {
  const accessToken = await getApsToken();
  const urn = Buffer.from(objectId).toString("base64").replace(/=+$/, "");

  let res: Response;
  try {
    res = await fetch(
      `${AUTODESK_BASIC_URL}${AUTODEKS_APIS.DERIVIATIVE.translateObject}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          region: "EMEA",
        },
        body: JSON.stringify({
          input: { urn },
          output: {
            formats: [{ type: "svf", views: ["2d", "3d"] }],
          },
        }),
      },
    );
  } catch (err) {
    throw new Error(`Network error translating object: ${err}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to translate object: ${res.status} ${body}`);
  }

  return { urn };
}

export async function getManifest(urn: string) {
  const accessToken = await getApsToken();

  let res: Response;
  try {
    res = await fetch(
      `${AUTODESK_BASIC_URL}${AUTODEKS_APIS.DERIVIATIVE.getManifest(urn)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          region: "EMEA",
        },
      },
    );
  } catch (err) {
    throw new Error(`Network error fetching manifest: ${err}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to get manifest: ${res.status} ${body}`);
  }

  try {
    return await res.json();
  } catch {
    throw new Error("Invalid JSON in manifest response");
  }
}

export async function createNewFolder(folderName: string) {
  const filePath = path.resolve(__dirname, "../../assets/.placeholder");
  const fileBuffer = await readFile(filePath);
  return await uploadFile(fileBuffer, encodeURIComponent(folderName));
}

export async function uploadUserFile(fileBuffer: Buffer, fileName: string) {
  const fileData = await uploadFile(fileBuffer, encodeURIComponent(fileName));
  const { objectId } = fileData;
  return { objectId };
}

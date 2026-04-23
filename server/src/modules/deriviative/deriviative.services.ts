import { getApsToken } from "@modules/auth/auth.service";
import { AUTODEKS_APIS, AUTODESK_BASIC_URL } from "../../apis/autodeskApis";
import { uploadFile } from "@modules/bucket/bucket.service";

export async function translateObject(objectId: string) {
  const accessToken = await getApsToken();
  const urn = Buffer.from(objectId)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  await fetch(
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

  return { urn };
}

export async function getManifest(urn: string) {
  const accessToken = await getApsToken();

  const res = await fetch(
    `${AUTODESK_BASIC_URL}${AUTODEKS_APIS.DERIVIATIVE.getManifest(urn)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        region: "EMEA",
      },
    },
  );

  return res.json();
}

export async function uploadUserModel(fileBuffer: Buffer, fileName: string) {
  const fileData = await uploadFile(fileBuffer, fileName);
  const { objectId } = fileData;
  const translatedFile = await translateObject(objectId);
  const { urn } = translatedFile;
  return { urn };
}

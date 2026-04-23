import { getApsToken } from "@modules/auth/auth.service";
import { AUTODESK_BASIC_URL, AUTODEKS_APIS } from "../../apis/autodeskApis";
import { formattedObjects } from "./bucket.domain";

export async function uploadFile(fileBuffer: Buffer, fileName: string) {
  const accessToken = await getApsToken();
  const bucketKey = process.env.BUCKET_KEY;
  if (!bucketKey) throw new Error("Missing bucket key");

  let getRes: Response;
  try {
    getRes = await fetch(
      `${AUTODESK_BASIC_URL}${AUTODEKS_APIS.OSS.getSignedS3Upload(bucketKey, fileName)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          region: "EMEA",
        },
      },
    );
  } catch (err) {
    throw new Error(`Network error fetching signed upload URL: ${err}`);
  }

  if (!getRes.ok) {
    const body = await getRes.text().catch(() => "");
    throw new Error(
      `Failed to get signed upload URL: ${getRes.status} ${body}`,
    );
  }

  let getData: { uploadKey: string; urls: string[] };
  try {
    getData = await getRes.json();
  } catch {
    throw new Error("Invalid JSON in signed upload URL response");
  }

  const { uploadKey, urls } = getData;

  let s3Res: Response;
  try {
    s3Res = await fetch(urls[0], {
      method: "PUT",
      body: new Uint8Array(fileBuffer),
      headers: { region: "EMEA" },
    });
  } catch (err) {
    throw new Error(`Network error uploading to S3: ${err}`);
  }

  if (!s3Res.ok) {
    const body = await s3Res.text().catch(() => "");
    throw new Error(`S3 upload failed: ${s3Res.status} ${body}`);
  }

  let completeRes: Response;
  try {
    completeRes = await fetch(
      `${AUTODESK_BASIC_URL}${AUTODEKS_APIS.OSS.getSignedS3Upload(bucketKey, fileName)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          region: "EMEA",
        },
        body: JSON.stringify({ uploadKey }),
      },
    );
  } catch (err) {
    throw new Error(`Network error completing upload: ${err}`);
  }

  if (!completeRes.ok) {
    const body = await completeRes.text().catch(() => "");
    throw new Error(`Failed to complete upload: ${completeRes.status} ${body}`);
  }

  try {
    return await completeRes.json();
  } catch {
    throw new Error("Invalid JSON in complete upload response");
  }
}

export async function listObjects() {
  const accessToken = await getApsToken();

  const bucketKey = process.env.BUCKET_KEY;
  if (!bucketKey) throw new Error("Missing bucket key");

  let res: Response;
  try {
    res = await fetch(
      `${AUTODESK_BASIC_URL}${AUTODEKS_APIS.OSS.listObjects(bucketKey)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  } catch (err) {
    throw new Error(`Network error listing objects: ${err}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to list objects: ${res.status} ${body}`);
  }

  try {
    const { items } = await res.json();
    return formattedObjects(items);
  } catch {
    throw new Error("Invalid JSON in list objects response");
  }
}

export async function deleteObject(ObjectKey: string) {
  const accessToken = await getApsToken();

  const bucketKey = process.env.BUCKET_KEY;
  if (!bucketKey) throw new Error("Missing bucket key");

  let res: Response;
  try {
    res = await fetch(
      `${AUTODESK_BASIC_URL}${AUTODEKS_APIS.OSS.deleteObject(bucketKey, encodeURIComponent(ObjectKey))}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  } catch (err) {
    throw new Error(`Network error deleting object: ${err}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to delete object: ${res.status} ${body}`);
  }

  try {
    return { success: true };
  } catch {
    throw new Error("Invalid JSON in delete object response");
  }
}

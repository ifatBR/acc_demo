import { getApsToken } from '@modules/auth/auth.service';
import { AUTODESK_BASIC_URL, AUTODEKS_APIS } from '../../apis/autodeskApis';
const BUCKET_KEY = 'ifat-test-bucket-123456';

export async function createBucket() {
  const accessToken = await getApsToken();
  const res = await fetch(`${AUTODESK_BASIC_URL}${AUTODEKS_APIS.OSS.createBucket}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      region: 'EMEA',
    },
    body: JSON.stringify({
      bucketKey: BUCKET_KEY,
      policyKey: 'transient',
    }),
  });

  const data = await res.json();

  return data;
}

export async function uploadFile(fileBuffer: Buffer, fileName: string) {
  const accessToken = await getApsToken();
  const bucketKey = BUCKET_KEY;
  const getRes = await fetch(
    `${AUTODESK_BASIC_URL}${AUTODEKS_APIS.OSS.getSignedS3Upload(bucketKey, fileName)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        region: 'EMEA',
      },
    },
  );
  const getData = await getRes.json();

  const { uploadKey, urls } = getData;

  const s3Res = await fetch(urls[0], {
    method: 'PUT',
    body: new Uint8Array(fileBuffer),
  });

  if (!s3Res.ok) {
    throw new Error(`s3 upload fialed ${s3Res.status} ${s3Res.text()}`);
  }

  const res = await fetch(
    `${AUTODESK_BASIC_URL}${AUTODEKS_APIS.OSS.getSignedS3Upload(bucketKey, fileName)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        region: 'EMEA',
      },
      body: JSON.stringify({ uploadKey }),
    },
  );
  const data = await res.json();

  return data;
}

export async function listObjects() {
  const accessToken = await getApsToken();

  const bucketKey = BUCKET_KEY;

  const res = await fetch(`${AUTODESK_BASIC_URL}${AUTODEKS_APIS.OSS.listObjects(bucketKey)}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return res.json();
}

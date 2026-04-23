import { API_BASE } from "@/constants/routes";

export const uploadFile = async (
  formData: FormData,
  fileName: string,
): Promise<{ urn: string }> => {
  formData.append("fileName", fileName);

  const res = await fetch(`${API_BASE}${"project/file"}`, {
    method: "POST",
    body: formData,
  });
  const resData = await res.json();
  return resData;
};

export const createFolder = async (params: {
  folderName: string;
}): Promise<{ urn: string }> => {
  const res = await fetch(`${API_BASE}${"project/folder"}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const resData = await res.json();
  return resData;
};

export const translateFile = async (params: {
  objectId: string;
}): Promise<{ urn: string }> => {
  const res = await fetch(`${API_BASE}project/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const resData = await res.json();
  return resData;
};

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function pollManifest(urn: string) {
  const maxTries = 20;
  const delay = 2000; // 2s

  for (let i = 0; i < maxTries; i++) {
    const res = await fetch(`${API_BASE}project/manifest/${urn}`);
    const data = await res.json();

    if (data.status === "success") {
      return data;
    }

    if (data.status === "failed") {
      throw new Error("Translation failed");
    }

    await sleep(delay);
  }

  throw new Error("Timeout waiting for translation");
}

export const getUrnToView = async (params: {
  objectId: string;
}): Promise<{ urn: string }> => {
  const { urn } = await translateFile(params);
  if (!urn) throw new Error("Failed to fetch URN");
  await pollManifest(urn);
  return { urn };
};

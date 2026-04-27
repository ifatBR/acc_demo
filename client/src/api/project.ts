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

export const translateFile = async (
  params: { objectId: string },
  signal?: AbortSignal,
): Promise<{ urn: string }> => {
  const res = await fetch(`${API_BASE}project/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    signal,
  });
  const resData = await res.json();
  return resData;
};

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

async function pollManifest(params: { urn: string }, signal?: AbortSignal) {
  const maxTries = 20;
  const delay = 2000;
  let progress;
  for (let i = 0; i < maxTries; i++) {
    const res = await fetch(`${API_BASE}project/manifest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
      signal,
    });

    if (res.status === 404) {
      const err: any = new Error("Manifest not found");
      err.status = 404;
      throw err;
    }

    if (!res.ok) {
      throw new Error(`Failed to get manifest: ${res.status}`);
    }

    const data = await res.json();

    if (data.status === "success") return data;
    if (data.status === "failed") throw new Error("Translation failed");
    progress = data.progress;

    await sleep(delay, signal);
  }

  throw new Error(
    `Model view still generating.\nTry again later.\n${progress || ""}`,
  );
}

function objectIdToUrn(objectId: string) {
  return btoa(objectId).replace(/=+$/, "");
}

export const getUrnToView = async (
  params: { objectId: string },
  signal?: AbortSignal,
): Promise<{ urn: string }> => {
  const urn = objectIdToUrn(params.objectId);

  try {
    await pollManifest({ urn }, signal);

    return { urn };
  } catch (err: any) {
    if (err.status !== 404) throw err;
  }

  await translateFile(params, signal);
  await pollManifest({ urn }, signal);

  return { urn };
};

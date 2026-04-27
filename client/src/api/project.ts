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
      headers: { "content-Type": "application/json" },
      body: JSON.stringify(params),
      signal,
    });

    if (!res.ok) {
      throw new Error(`Failed to view file`);
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

export const getUrnToView = async (
  params: { objectId: string },
  signal?: AbortSignal,
): Promise<{ urn: string }> => {
  const { urn } = await translateFile(params, signal);
  if (!urn) throw new Error("Failed to fetch URN");
  await pollManifest({ urn }, signal);
  return { urn };
};

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

import { API_BASE } from "@/constants/routes";

export const uploadModel = async (
  formData: FormData,
): Promise<{ urn: string }> => {
  const res = await fetch(`${API_BASE}${"deriviative/models/upload"}`, {
    method: "POST",
    body: formData,
  });
  const resData = await res.json();
  return resData;
};

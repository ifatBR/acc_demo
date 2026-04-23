import { API_BASE } from "@/constants/routes";

export interface BucketObject {
  objectKey: string;
  objectId: string;
  size: string;
}
export const getBucketObjects = async (): Promise<BucketObject[]> => {
  const res = await fetch(`${API_BASE}${"bucket/objects"}`, {
    method: "GET",
  });
  const resData = await res.json();
  return resData;
};

export const deleteObjectById = async (objectKey: string): Promise<void> => {
  const res = await fetch(`${API_BASE}bucket/object/${objectKey}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete "${objectKey}": ${res.status}`);
  }
};

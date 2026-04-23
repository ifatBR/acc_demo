export const AUTODESK_BASIC_URL = "https://developer.api.autodesk.com/";
export const AUTODEKS_APIS = {
  getToken: "authentication/v2/token",
  OSS: {
    createBucket: "oss/v2/buckets",
    getSignedS3Upload: (bucketKey: string, objectKey: string) =>
      `/oss/v2/buckets/${bucketKey}/objects/${objectKey}/signeds3upload`,
    listObjects: (bucketKey: string) => `oss/v2/buckets/${bucketKey}/objects`,
  },
  DERIVIATIVE: {
    translateObject: "modelderivative/v2/designdata/job",
    getManifest: (urn: string) =>
      `modelderivative/v2/designdata/${urn}/manifest`,
  },
};

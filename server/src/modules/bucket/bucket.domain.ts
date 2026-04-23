export const formattedObjects = (
  objects: {
    objectKey: string;
    objectId: string;
    size: number;
  }[],
) => {
  return objects.map(
    ({
      objectKey,
      objectId,
      size,
    }: {
      objectKey: string;
      objectId: string;
      size: number;
    }) => {
      return { objectKey, objectId, size };
    },
  );
};

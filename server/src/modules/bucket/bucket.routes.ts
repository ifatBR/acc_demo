import { FastifyInstance } from "fastify";
import { uploadFile, listObjects, deleteObject } from "./bucket.service";

//Test endpoint separately

export async function bucketRoutes(app: FastifyInstance) {
  app.post("/upload", async (req, reply) => {
    const file = await req.file({
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
    });

    if (!file) {
      return reply.code(400).send({ error: "No file uploaded" });
    }

    const fileBuffer = await file.toBuffer();
    return uploadFile(fileBuffer, file.filename);
  });

  app.get("/objects", async () => listObjects());

  app.delete<{ Params: { objectKey: string } }>(
    "/object/:objectKey",
    (req, reply) => {
      const { objectKey } = req.params;

      if (!objectKey) {
        return reply.code(400).send({ error: "No objectKey sent" });
      }
      return deleteObject(objectKey);
    },
  );
}

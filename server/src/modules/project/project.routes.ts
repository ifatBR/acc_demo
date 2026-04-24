import { FastifyInstance } from "fastify";
import {
  createNewFolder,
  getManifest,
  translateObject,
  uploadUserFile,
} from "./project.services";

export async function projectRoutes(app: FastifyInstance) {
  app.post<{ Body: { objectId: string } }>("/translate", async (req) => {
    const { objectId } = req.body;
    return translateObject(objectId);
  });

  app.post<{ Body: { urn: string } }>("/manifest", async (req, reply) => {
    const { urn } = req.body;
    if (!urn) {
      return reply.code(400).send({ error: "URN name missing" });
    }
    return getManifest(urn);
  });

  app.post<{ Body: { folderName: string } }>("/folder", async (req, reply) => {
    const { folderName } = req.body;

    if (!folderName) {
      return reply.code(400).send({ error: "Folder name missing" });
    }

    return createNewFolder(folderName);
  });

  app.post<{ Body: { fileName: string } }>("/file", async (req, reply) => {
    const parts = req.parts({
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
    });
    let fileBuffer: Buffer | null = null;
    let fileName = "";

    for await (const part of parts) {
      if (part.type === "file") {
        fileBuffer = await part.toBuffer();
      } else if (part.fieldname === "fileName") {
        fileName = String(part.value);
      }
    }
    if (!fileBuffer) {
      return reply.code(400).send({ error: "No file uploaded" });
    }
    if (!fileName) {
      return reply.code(400).send({ error: "File name missing" });
    }
    return uploadUserFile(fileBuffer, fileName);
  });
}

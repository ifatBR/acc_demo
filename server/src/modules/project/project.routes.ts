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

  app.get<{ Params: { urn: string } }>("/manifest/:urn", async (req) => {
    const { urn } = req.params;
    return getManifest(urn);
  });

  app.post<{ Body: { projectName: string } }>("/folder", async (req, reply) => {
    const { projectName } = req.body;

    if (!projectName) {
      return reply.code(400).send({ error: "Project name missing" });
    }

    return createNewFolder(projectName);
  });

  app.post<{ Body: { fileName: string } }>("/file", async (req, reply) => {
    const parts = await req.parts({
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

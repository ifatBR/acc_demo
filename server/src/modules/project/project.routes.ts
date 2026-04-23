import { FastifyInstance } from "fastify";
import {
  createNewProject,
  getManifest,
  translateObject,
  uploadUserFile,
} from "./project.services";

export async function projectRoutes(app: FastifyInstance) {
  app.post<{ Body: { objectId: string } }>("/translate", async (req) => {
    const { objectId } = req.body;
    return translateObject(objectId);
  });

  app.post<{ Body: { urn: string } }>("/manifest", async (req) => {
    const { urn } = req.body;
    return getManifest(urn);
  });

  app.post<{ Body: { projectName: string } }>("/", async (req, reply) => {
    const { projectName } = req.body;

    if (!projectName) {
      return reply.code(400).send({ error: "Project name missing" });
    }

    return createNewProject(projectName);
  });

  app.post<{ Body: { fileName: string } }>("/file", async (req, reply) => {
    const file = await req.file({
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
    });
    const fileName = (file?.fields?.fileName as { value: string } | undefined)
      ?.value;

    if (!file) {
      return reply.code(400).send({ error: "No file uploaded" });
    }
    if (!fileName) {
      return reply.code(400).send({ error: "File name missing" });
    }
    const fileBuffer = await file.toBuffer();
    return uploadUserFile(fileBuffer, fileName);
  });
}

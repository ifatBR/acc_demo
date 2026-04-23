import { FastifyInstance } from 'fastify';
import { getManifest, translateObject, uploadUserModel } from './deriviative.services';

export async function deriviativeRoutes(app: FastifyInstance) {
  app.post<{ Body: { objectId: string } }>('/translate', async (req) => {
    const { objectId } = req.body;
    return translateObject(objectId);
  });

  app.post<{ Body: { urn: string } }>('/manifest', async (req) => {
    const { urn } = req.body;
    return getManifest(urn);
  });

  // Upload endpoint for viewer

  app.post<{ Body: { urn: string } }>('/models/upload', async (req, reply) => {
    const file = await req.file({
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
    });

    if (!file) {
      return reply.code(400).send({ error: 'No file uploaded' });
    }

    const fileBuffer = await file.toBuffer();
    return uploadUserModel(fileBuffer, file.filename);
  });
}

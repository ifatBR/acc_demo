import { authRoutes } from "@modules/auth/auth.routes";
import { bucketRoutes } from "@modules/bucket/bucket.routes";
import { projectRoutes } from "@modules/project/project.routes";
import { FastifyInstance } from "fastify";

async function apiRoutes(fastify: FastifyInstance) {
  fastify.register(authRoutes, { prefix: "/auth" });
  fastify.register(bucketRoutes, { prefix: "/bucket" });
  fastify.register(projectRoutes, { prefix: "/project" });
}

export default apiRoutes;

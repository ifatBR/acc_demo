import { authRoutes } from "@modules/auth/auth.routes";
import { bucketRoutes } from "@modules/bucket/bucket.routes";
import { deriviativeRoutes } from "@modules/deriviative/deriviative.routes";
import { FastifyInstance } from "fastify";

async function apiRoutes(fastify: FastifyInstance) {
  fastify.register(authRoutes, { prefix: "/auth" });
  fastify.register(bucketRoutes, { prefix: "/bucket" });
  fastify.register(deriviativeRoutes, { prefix: "/deriviative" });
}

export default apiRoutes;

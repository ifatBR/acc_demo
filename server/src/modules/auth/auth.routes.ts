import { FastifyInstance } from "fastify";
import { requestApsToken } from "./auth.service";

//Test endpoint separately

export async function authRoutes(app: FastifyInstance) {
  app.get("/token", async () => {
    return requestApsToken(["viewables:read"]);
  });
}

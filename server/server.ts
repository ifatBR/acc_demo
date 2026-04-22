import "dotenv/config";
import Fastify from "fastify";
import multipart from "@fastify/multipart";
import cors from "@fastify/cors";

const app = Fastify({
  logger: true,
  routerOptions: { ignoreTrailingSlash: true },
});

app.register(multipart);
app.register(cors, { origin: ["http://localhost:5173"] });
app.listen({ port: 3000 }, function (err, address) {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});

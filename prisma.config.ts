import path from "node:path";

export default {
  schema: path.join(import.meta.dirname, "src/prisma/schema.prisma"),
};

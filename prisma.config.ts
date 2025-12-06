import path from "node:path";

export default {
  schema: path.join(import.meta.dirname, "prisma/schema.prisma"),
};

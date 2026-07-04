import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Prisma 7 usa o gerador `prisma-client` (sem engine Rust), pelo que a ligação
// passa por um driver adapter — aqui o adapter oficial sobre `pg`.
const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });

// Singleton: evita esgotar ligações com o hot-reload do `next dev`.
const globalForPrisma = globalThis as unknown as {
  prisma?: InstanceType<typeof PrismaClient>;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

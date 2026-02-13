
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const password = await hash("password123", 12);

    // Create User 1
    const user1 = await prisma.user.upsert({
        where: { phone: "0600000001" },
        update: { reputationScore: 95 },
        create: {
            phone: "0600000001",
            username: "user1",
            name: "User One",
            password,
            type: "INDIVIDUAL",
            reputationScore: 95,
        }
    });

    // Create User 2
    const user2 = await prisma.user.upsert({
        where: { phone: "0600000002" },
        update: { reputationScore: 65 },
        create: {
            phone: "0600000002",
            username: "user2",
            name: "User Two",
            password,
            type: "INDIVIDUAL",
            reputationScore: 65,
        }
    });

    console.log({ user1, user2 });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

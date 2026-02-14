
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db as prisma } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('user_id')?.value

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const conversationId = searchParams.get("conversationId");

        // 1. Get All Conversations for a User
        if (!conversationId) {
            const conversations = await prisma.conversation.findMany({
                where: {
                    OR: [
                        { participant1Id: userId },
                        { participant2Id: userId }
                    ]
                },
                include: {
                    participant1: { select: { id: true, name: true, avatarUrl: true, username: true } },
                    participant2: { select: { id: true, name: true, avatarUrl: true, username: true } },
                    messages: {
                        take: 1,
                        orderBy: { createdAt: "desc" }
                    }
                },
                orderBy: { updatedAt: "desc" }
            });
            return NextResponse.json(conversations);
        }

        // 2. Get Messages for a Specific Conversation
        let targetConversationId = conversationId;

        // Handle temporary IDs (conv-ID1-ID2)
        if (targetConversationId && targetConversationId.startsWith("conv-")) {
            const parts = targetConversationId.replace("conv-", "").split("-");
            // Basic validation: we expect at least 2 parts (2 UUIDs might be split by more dashes if not careful, but UUIDs have dashes!)
            // Re-think: UUIDs have dashes. conv-UUID1-UUID2.
            // UUID has 4 dashes. So total 9 dashes + "conv".
            // Simpler: Use the provided userId, find the other ID from the string.
            // But string parsing with extra dashes is risky.
            // Better: Just search for a conversation involving userId and the "other" ID if we can isolate it.
            // Alternative: Since we only need this for the "Mock" setup, let's assume the ID is NOT valid and try to find a conversation for this user that MIGHT match?
            // Actually, we can just search for ANY conversation involving these participants if we knew them.
            // Let's rely on the POST to return the REAL ID, and the client "should" switch to it. 
            // BUT initial load will be empty. That is fine for now. 
            // If the user sends a message, they get the real ID.

            // For now, if it's a temp ID, we probably won't find it in DB.
            // Let's TRY to resolve it if possible, otherwise let it fail gracefully (return empty).
            // logic: find first conversation between the 2 users implied?
            // The string is `conv-SORTED_ID_1-SORTED_ID_2`. 
            // UUID is 36 chars.
            // ID1 = substring(5, 41)
            // ID2 = substring(42, 78)
            if (targetConversationId.length >= 78) {
                const id1 = targetConversationId.substring(5, 41);
                const id2 = targetConversationId.substring(42, 78);

                const existing = await prisma.conversation.findFirst({
                    where: {
                        AND: [{ participant1Id: id1 }, { participant2Id: id2 }] // Order matters in scheme? OR logic needed
                    }
                });
                // Our schema relations don't enforce order strictly in search without OR usually, but let's check
                // actually standard pattern is:
                const real = await prisma.conversation.findFirst({
                    where: {
                        OR: [
                            { AND: [{ participant1Id: id1 }, { participant2Id: id2 }] },
                            { AND: [{ participant1Id: id2 }, { participant2Id: id1 }] }
                        ]
                    }
                });
                if (real) targetConversationId = real.id;
            }
        }


        // 🛡️ Security Check: Verify User is a Participant
        if (targetConversationId && !targetConversationId.startsWith("conv-")) {
            const conversation = await prisma.conversation.findUnique({
                where: { id: targetConversationId },
                select: { participant1Id: true, participant2Id: true }
            });

            if (!conversation) {
                return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
            }

            if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
                return NextResponse.json({ error: "Unauthorized access to this conversation" }, { status: 403 });
            }
        }

        const messages = await prisma.message.findMany({
            where: { conversationId: targetConversationId },
            orderBy: { createdAt: "asc" },
            include: {
                sender: { select: { id: true, name: true, avatarUrl: true } }
            }
        });

        return NextResponse.json(messages);

    } catch (error) {
        console.error("[MESSAGES_GET]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { senderId, receiverId, content, conversationId } = body;

        // Auth: verify sender matches session
        const cookieStore = await cookies()
        const sessionUserId = cookieStore.get('user_id')?.value

        if (!sessionUserId || sessionUserId !== senderId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!content) {
            console.error("[API_MESSAGES_POST] Missing content");
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        let activeConversationId = conversationId;

        // Handle temporary client-side IDs
        if (activeConversationId && activeConversationId.startsWith("conv-")) {
            activeConversationId = null;
        }

        // If no conversation exists, create one or find existing
        if (!activeConversationId && receiverId) {
            // Check if conversation already exists between these two
            const existingConv = await prisma.conversation.findFirst({
                where: {
                    OR: [
                        { AND: [{ participant1Id: senderId }, { participant2Id: receiverId }] },
                        { AND: [{ participant1Id: receiverId }, { participant2Id: senderId }] }
                    ]
                }
            });

            if (existingConv) {
                activeConversationId = existingConv.id;
            } else {
                const newConv = await prisma.conversation.create({
                    data: {
                        participant1Id: senderId,
                        participant2Id: receiverId
                    }
                });
                activeConversationId = newConv.id;
            }
        }

        // Create the message
        const message = await prisma.message.create({
            data: {
                content,
                senderId,
                conversationId: activeConversationId
            },
            include: {
                sender: { select: { id: true, name: true, avatarUrl: true } }
            }
        });

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id: activeConversationId },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json(message);

    } catch (error) {
        console.error("[MESSAGES_POST]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

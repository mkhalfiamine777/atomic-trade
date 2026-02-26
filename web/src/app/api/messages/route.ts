
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db as prisma } from "@/lib/db";
import { getOrCreateConversation } from "@/services/conversationService";

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

        // If the client passes a temporary ID, we ignore looking up messages
        // because the conversation doesn't exist yet, so there are no messages to fetch.
        if (targetConversationId && targetConversationId.startsWith("conv-")) {
            return NextResponse.json([]); // Return empty messages list natively
        }

        // 🛡️ Security Check: Verify User is a Participant
        if (targetConversationId) {
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

        // If the client passes a temporary ID, it means the conversation hasn't been created yet.
        // We nullify it so the server creates a real one.
        if (activeConversationId && activeConversationId.startsWith("conv-")) {
            activeConversationId = null;
        }

        // If no valid conversation exists, create one using our secure service
        if (!activeConversationId && receiverId) {
            const { conversationId } = await getOrCreateConversation(senderId, receiverId, null);
            activeConversationId = conversationId;
        }

        // Failsafe: if we still don't have an ID, we cannot proceed
        if (!activeConversationId) {
            return NextResponse.json({ error: "Could not resolve or create conversation" }, { status: 400 });
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

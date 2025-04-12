import { prisma } from "@/lib/prisma"
import { NextApiResponse, NextApiRequest } from "next"


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.query
    if (!id || Array.isArray(id)) {
        return res.status(400).json({ message: "Invalid ID" })
    }

    if (req.method === "POST") {
        const post = await prisma.post.update({
            where: { id },
            data: { likes: { increment: 1 } },
        })
        return res.status(200).json(post)
    }
    res.status(405).json({ message: "Method not allowed" })
}

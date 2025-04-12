import { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/lib/prisma"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { markerId } = req.query
    if (!markerId || Array.isArray(markerId)) {
        return res.status(400).json({ message: "Invalid ID" })
    }

    if (req.method === "GET") {
        const posts = await prisma.post.findMany({
            where: { markerId },
            orderBy: { likes: "desc" },
          });
        
        if (!posts) return res.status(404).json({ message: "Posts not found" })
        
        return res.status(200).json(posts)
    } else if (req.method === "POST") {
        const { title, content, password } = req.body
        const post = await prisma.post.create({
            data: {
              title,
              content,
              password,
              markerId,
            },
          });
        if (!post) return res.status(404).json({ message: "Post not created" })
        
        return res.status(200).json({ message: "Post created" })
    }
    res.status(405).json({ message: "Method not allowed" })
}
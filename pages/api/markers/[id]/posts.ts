import { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.query
    if (!id || Array.isArray(id)) {
        return res.status(400).json({ message: "Invalid ID" })
    }

    if (req.method === "GET") {
        const posts = await prisma.post.findMany({
            where: { markerId:id },
            orderBy: { likes: "desc" },
          });
        
        if (!posts) return res.status(404).json({ message: "Posts not found" })
        
        return res.status(200).json(posts)
    } else if (req.method === "POST") {
        const { title, content, password } = req.body
        const hashedPassword = await bcrypt.hash(password, 10);
        const post = await prisma.post.create({
            data: {
              title,
              content,
              password: hashedPassword,
              markerId :id,
            },
          });
        if (!post) return res.status(404).json({ message: "Post not created" })
        
        return res.status(200).json({ message: "Post created" })
    }
    res.setHeader("Allow", ["GET", "POST"]).status(405).json({ message: "허용되지 않은 메서드입니다." })
  }
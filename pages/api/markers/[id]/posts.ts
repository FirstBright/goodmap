import { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { getRedis } from "@/lib/redis";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const redis = await getRedis();
    const markerId = req.query.id as string;
    const cacheKey = `posts:${markerId}`;

    if (req.method === "GET") {
        try {
            const cached = await redis.get(cacheKey);
            if (cached) return res.status(200).json(JSON.parse(cached));
            const posts = await prisma.post.findMany({
                where: { markerId },
                orderBy: { createdAt: "desc" },
            })
            await redis.setEx(cacheKey, 60, JSON.stringify(posts));
            res.status(200).json(posts)
        } catch (error) {
            console.error("Error fetching posts:", error)
            res.status(500).json({ message: "Failed to fetch posts" })
        }
    } else if (req.method === "POST") {
        const { title, content, password } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)
        console.time(`create-post-${markerId}`);
        try {
            const post = await prisma.post.create({
                data: {
                    title,
                    content,
                    password: hashedPassword,
                    markerId,
                },
            })
            await redis.del(cacheKey);
            console.timeEnd(`like-${req.query.id}`);
            res.status(201).json(post)
        } catch (error) {
            console.error("Error creating post:", error)
            res.status(500).json({ message: "Failed to create post" })
        }
    } else {
        res.setHeader("Allow", ["GET", "POST"])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}

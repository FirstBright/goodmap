import { prisma } from "@/lib/prisma"
import { NextApiResponse, NextApiRequest } from "next"
import { getRedis } from "@/lib/redis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.time(`like-${req.query.id}`);
    if (req.method === "POST") {
      try {
        const post = await prisma.post.update({
          where: { id: req.query.id as string },
          data: { likes: { increment: 1 } },
          include: { marker: { select: { id: true } } }, // Get markerId
        });
        const redis = await getRedis();
        const cacheKey = `posts:${post.marker.id}`;
        await redis.del(cacheKey); // Invalidate cache
        console.timeEnd(`like-${req.query.id}`);
        return res.status(200).json(post);
      } catch (error) {
        console.error("Error updating likes:", error);
        return res.status(500).json({ message: "Failed to update likes" });
      }
    }
    res.status(405).json({ message: "Method not allowed" });
  }
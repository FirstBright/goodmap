import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getSession } from "next-auth/react";
import bcrypt from "bcryptjs";
import { getRedis } from "@/lib/redis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });
    const redis = await getRedis();
    const { id } = req.query;

    if (req.method === "DELETE") {
        try {
            const { password } = req.body;
            const post = await prisma.post.findUnique({
                where: { id: String(id) },
                include: { marker: { select: { id: true } } },
            });

            if (!post) {
                return res.status(404).json({ message: "포스트를 찾을 수 없습니다." });
            }

            // Admin can delete without password
            if (!session || !session.user.isAdmin) {
                if (!password) {
                    return res.status(400).json({ message: "비밀번호가 필요합니다." });
                }
                const isValid = await bcrypt.compare(password, post.password);
                if (!isValid) {
                    return res.status(403).json({ message: "비밀번호가 틀렸습니다." });
                }
            }

            await prisma.post.delete({
                where: { id: String(id) },
            });
            const cacheKey = `posts:${post.marker.id}`; // Correct cache key
            await redis.del(cacheKey);
            // Return data for SWR
            return res.status(200).json({ postId: id, markerId: post.marker.id });
        } catch (error) {
            console.error("Error deleting post:", error);
            return res.status(500).json({ message: "포스트 삭제 중 오류가 발생했습니다." });
        }
    } else if (req.method === "PATCH") {
        try {
            const { title, content, password } = req.body;
            const post = await prisma.post.findUnique({
                where: { id: String(id) },
                include: { marker: { select: { id: true } } },
            });

            if (!post) {
                return res.status(404).json({ message: "포스트를 찾을 수 없습니다." });
            }         

            const updatedPost = await prisma.post.update({
                where: { id: String(id) },
                data: { title, content },
            });
            const cacheKey = `posts:${post.marker.id}`;
            await redis.del(cacheKey);
            return res.status(200).json(updatedPost);
        } catch (error) {
            console.error("Error updating post:", error);
            return res.status(500).json({ message: "포스트 수정 중 오류가 발생했습니다." });
        }
    } else {
        return res.setHeader("Allow", ["DELETE", "PATCH"]).status(405).json({ message: "허용되지 않은 메서드입니다." });
    }
}
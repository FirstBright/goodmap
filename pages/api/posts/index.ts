import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getSession } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session || !session.user.isAdmin) {
    return res.status(403).json({ message: "어드민 권한이 필요합니다." });
  }

  if (req.method === "GET") {
    try {
      const posts = await prisma.post.findMany({
        select: { id: true, title: true, markerId: true },
      });
      console.log("Returning posts:", posts);
      return res.status(200).json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      return res.status(500).json({ message: "포스트 조회 중 오류가 발생했습니다." });
    }
  } else {
    return res.setHeader("Allow", ["GET"]).status(405).json({ message: "허용되지 않은 메서드입니다." });
  }
}
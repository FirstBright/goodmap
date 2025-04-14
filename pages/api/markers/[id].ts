import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getSession } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session || !session.user.isAdmin) {
    return res.status(403).json({ message: "어드민 권한이 필요합니다." });
  }

  const { id } = req.query;

  if (req.method === "DELETE") {
    try {
      await prisma.marker.delete({
        where: { id: String(id) },
      });
      console.log(`Deleted marker: ${id}`);
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting marker:", error);
      return res.status(500).json({ message: "마커 삭제 중 오류가 발생했습니다." });
    }
  } else {
    return res.setHeader("Allow", ["DELETE"]).status(405).json({ message: "허용되지 않은 메서드입니다." });
  }
}
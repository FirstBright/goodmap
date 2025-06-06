import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`Received ${req.method} request to /api/markers`);
  if (req.method === "GET") {
    try {
      const { name } = req.query;
      const markers = await prisma.marker.findMany({
        where: name
          ? { name: { contains: String(name), mode: "insensitive" } }
          : {},
        include: {
          posts: {
            select: { id: true }, // Minimal data to check if posts exist
          },
        },
      });
      console.log("Returning markers:", markers);
      return res.status(200).json(markers);
    } catch (error) {
      console.error("Error fetching markers:", error);
      return res.status(500).json({ message: "마커 조회 중 오류가 발생했습니다." });
    }
  } else if (req.method === "POST") {
    const { name, latitude, longitude, tags } = req.body;
    console.log("POST request body:", { name, latitude, longitude });

    if (!name || typeof latitude !== "number" || typeof longitude !== "number") {
      console.log("Invalid input data");
      return res.status(400).json({ message: "이름, 위도, 경도는 필수입니다." });
    }

    try {
      const existingMarker = await prisma.marker.findFirst({
        where: { latitude, longitude },
      });

      if (existingMarker) {
        console.log("Marker already exists at this location");
        return res.status(400).json({ message: "이미 해당 위치에 마커가 있습니다." });
      }

      const marker = await prisma.marker.create({
        data: { name, latitude, longitude, tags: tags || [] },
      });
      console.log("Created marker:", marker);
      return res.status(201).json(marker);
    } catch (error) {
      console.error("Error creating marker:", error);
      return res.status(500).json({ message: "마커 생성 중 오류가 발생했습니다." });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // 1. Secure the endpoint: Check for cron secret or admin session
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    if (authHeader === `Bearer ${cronSecret}`) {
        // Request is from our cron job, allow it
    } else {
        // Check for admin session for manual runs
        const session = await getSession({ req });
        if (!session || !session.user.isAdmin) {
            return res.status(403).json({ message: 'Forbidden: Access is restricted.' });
        }
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');

        // 2. Get all image filenames from the filesystem
        const filesInDir = await fs.readdir(uploadDir);
        const imageFiles = new Set(filesInDir);

        // 3. Get all post content from the database
        const posts = await prisma.post.findMany({
            select: {
                content: true,
            },
        });

        // Concatenate all HTML content into one large string for efficient searching
        const allContent = posts.map(post => post.content).join('');

        let orphanedCount = 0;
        const deletedFiles: string[] = [];

        // 4. Compare and find orphans
        for (const filename of imageFiles) {
            // We check if the filename is present in the concatenated content string.
            // The URL in the content is `/uploads/filename.webp`.
            if (!allContent.includes(`/uploads/${filename}`)) {
                const filePath = path.join(uploadDir, filename);
                try {
                    // 5. Delete the orphaned file
                    await fs.unlink(filePath);
                    orphanedCount++;
                    deletedFiles.push(filename);
                } catch (unlinkError) {
                    console.error(`Failed to delete orphaned file: ${filename}`, unlinkError);
                }
            }
        }

        return res.status(200).json({
            message: `Cleanup successful. Found and deleted ${orphanedCount} orphaned files.`,
            deletedFiles,
        });

    } catch (error) {
        console.error('Error during image cleanup:', error);
        return res.status(500).json({ message: 'An error occurred during the cleanup process.' });
    }
}

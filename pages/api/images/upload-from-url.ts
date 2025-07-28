
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Ensure the upload directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper to validate the URL is a valid image URL
const isImageUrl = async (url: string): Promise<boolean> => {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentType = response.headers.get('content-type');
        return contentType?.startsWith('image/') ?? false;
    } catch (error) {
        console.error('Error validating image URL:', error);
        return false;
    }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const { url } = req.body;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required.' });
    }

    const isValidImage = await isImageUrl(url);
    if (!isValidImage) {
        return res.status(400).json({ error: 'Invalid image URL or the URL does not point to an image.' });
    }

    try {
        // Fetch the image from the external URL
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image. Status: ${response.status}`);
        }
        const imageBuffer = Buffer.from(await response.arrayBuffer());

        // Generate a unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const newWebPFileName = `image-${uniqueSuffix}.webp`;
        const newPath = path.join(uploadDir, newWebPFileName);

        // Process the image with sharp
        await sharp(imageBuffer)
            .resize(800) // Resize to a max width of 800px
            .webp({ quality: 80 }) // Convert to webp with 80% quality
            .toFile(newPath);

        const publicUrl = `/uploads/${newWebPFileName}`;
        return res.status(200).json({ url: publicUrl });

    } catch (error) {
        console.error('Error processing image from URL:', error);
        return res.status(500).json({ error: 'Error processing image.' });
    }
}

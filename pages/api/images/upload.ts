
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Disable the default body parser, as formidable will handle it
export const config = {
    api: {
        bodyParser: false,
    },
};

// Ensure the upload directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const form = formidable({
        uploadDir,
        keepExtensions: true,
        // Generate a unique filename to prevent overwrites
        filename: (name, ext, part) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            return `${part.name}-${uniqueSuffix}${ext}`;
        },
        // Filter to only allow image files
        filter: function ({ name, originalFilename, mimetype }) {
            const valid = mimetype && mimetype.includes('image');
            if (!valid) {
                form.emit('error' as any, new Error('File type is not an image') as any);
            }
            return valid;
        },
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error parsing form:', err);
            return res.status(400).json({ error: `Image upload failed: ${err.message}` });
        }

        const file = files.file?.[0];

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const tempPath = file.filepath;
        const newWebPFileName = `${path.basename(tempPath, path.extname(tempPath))}.webp`;
        const newPath = path.join(uploadDir, newWebPFileName);

        try {
            await sharp(tempPath)
                .resize(800) // Resize to a max width of 800px
                .webp({ quality: 80 }) // Convert to webp with 80% quality
                .toFile(newPath);

            // Clean up the original uploaded file
            fs.unlinkSync(tempPath);

            const publicUrl = `/uploads/${newWebPFileName}`;
            return res.status(200).json({ url: publicUrl });

        } catch (sharpError) {
            console.error('Error processing image with sharp:', sharpError);
            // Clean up the temp file in case of an error
            if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
            return res.status(500).json({ error: 'Error processing image.' });
        }
    });
}


import cron from 'node-cron';

// This function will be called by the cron job
const cleanupImages = async () => {
    console.log('Running scheduled image cleanup...');
    try {
        // We need to use the absolute URL for the API endpoint
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/admin/cleanup-images`, {
            method: 'POST',
            headers: {
                // We need a way to authenticate this request.
                // Using a secret token is a common approach for internal cron jobs.
                'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            },
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Image cleanup successful:', result.message);
        } else {
            const errorResult = await response.json();
            console.error('Image cleanup failed:', errorResult.message);
        }
    } catch (error) {
        console.error('An error occurred while running the image cleanup job:', error);
    }
};

// --- Singleton Pattern to ensure cron is scheduled only once ---
declare global {
    let __cron_scheduled__: boolean | undefined;
}

if (!global.__cron_scheduled__) {
    // Schedule the job to run every day at 3:00 AM
    // The cron syntax is: minute hour day-of-month month day-of-week
    cron.schedule('0 3 * * *', cleanupImages, {
        scheduled: true,
        timezone: "Asia/Seoul",
    });

    console.log('Cron job for image cleanup has been scheduled.');
    global.__cron_scheduled__ = true;
}

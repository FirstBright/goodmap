import Navbar from "@/components/Navbar";
import Head from "next/head";

export default function PrivacyPolicy() {
    return (
        <>
            <Head>
                <title>Privacy Policy - GoodMap</title>
                <meta name="description" content="Read GoodMap's privacy policy to understand how we handle your data." />
            </Head>
            <Navbar />
            <main className="min-h-screen bg-gray-100 py-8 pt-16 ">
                <section className="w-full max-w-[1080px] mx-auto px-4 text-gray-800">
                    <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
                    <p className="mb-4">
                        At GoodMap, we value your privacy. This policy outlines how we collect, use, and protect your personal information.
                    </p>
                    <h2 className="text-2xl font-semibold mb-2">Data Collection</h2>
                    <p className="mb-4">
                        We collect minimal data, such as location preferences stored in localStorage, to enhance your experience.
                    </p>
                    <h2 className="text-2xl font-semibold mb-2">Data Usage</h2>
                    <p className="mb-4">
                        Your data is used solely to provide and improve our services. We do not share your information with third parties without your consent.
                    </p>
                    <h2 className="text-2xl font-semibold mb-2">Cookies</h2>
                    <p className="mb-4">
                        We use cookies to remember your preferences and enhance your experience on our site. You can manage your cookie settings through your browser.
                    </p>
                    <h2 className="text-2xl font-semibold mb-2">Security</h2>
                    <p className="mb-4">
                        We take the security of your data seriously. We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, use, or disclosure.
                    </p>
                    <h2 className="text-2xl font-semibold mb-2">Changes to This Policy</h2>
                    <p className="mb-4">
                        We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on our site. You are advised to review this policy periodically for any changes.
                    </p>
                    <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
                    <p className="mb-4">
                        If you have any questions or concerns about this privacy policy, please contact us at mipo8890@gmail.com
                    </p>
                </section>
            </main>
        </>
    );
}
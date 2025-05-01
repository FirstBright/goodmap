import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { getLanguageText } from "@/utils/language";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const text = getLanguageText();

    // Toggle menu
    const toggleMenu = () => {
        setIsOpen((prev) => !prev);
    };

    // Close menu on outside click or Escape key
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isOpen) {
                setIsOpen(false);
                buttonRef.current?.focus();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    // Menu items
    const menuItems = [
        { href: "/", label: text.searchPlaceholder === "장소 이름으로 검색..." ? "홈" : "Home" },
        { href: "/about", label: text.searchPlaceholder === "장소 이름으로 검색..." ? "소개" : "About" },
        {
            href: "/privacy-policy",
            label: text.searchPlaceholder === "장소 이름으로 검색..." ? "개인정보 정책" : "Privacy Policy",
        },
    ];

    return (

        <nav className="bg-gray-100 py-1  fixed w-full top-0 z-[1001] ">
            <div className="w-full max-w-[1080px] mx-auto px-4 flex justify-between ">
                <Link href="/" className="text-xl font-bold text-gray-900 pt-1">
                    GoodMap
                </Link>
                <button
                    ref={buttonRef}
                    className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={toggleMenu}
                    aria-expanded={isOpen}
                    aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                >
                    <svg
                        className="w-6 h-6 text-gray-900"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                        />
                    </svg>
                </button>
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={menuRef}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="w-full max-w-[1080px] mx-auto px-4 pt-2 pb-4 bg-white shadow-md"
                    >
                        <ul className="flex flex-col gap-4">
                            {menuItems.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
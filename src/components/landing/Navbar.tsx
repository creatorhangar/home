"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, LogIn, User, LogOut } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, loading, signOut } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-display font-bold text-primary hover:text-primary/80 transition-colors">
                        Creative Hangar
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/#how-it-works" className="text-gray-700 hover:text-primary transition-colors font-medium">
                            Como Funciona
                        </Link>
                        <Link href="/#pricing" className="text-gray-700 hover:text-primary transition-colors font-medium">
                            Planos
                        </Link>

                        {/* Auth Buttons */}
                        {loading ? (
                            <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                        ) : user ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors font-medium"
                                >
                                    <User className="w-5 h-5" />
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors font-medium"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Sair
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/login"
                                    className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors font-medium"
                                >
                                    <LogIn className="w-5 h-5" />
                                    Login
                                </Link>
                                <Link
                                    href="/signup"
                                    className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-lg"
                                >
                                    Começar Grátis
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {isOpen ? (
                            <X className="w-6 h-6 text-gray-700" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-700" />
                        )}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200">
                        <div className="flex flex-col gap-4">
                            <Link
                                href="/#how-it-works"
                                className="text-gray-700 hover:text-primary transition-colors font-medium"
                                onClick={() => setIsOpen(false)}
                            >
                                Como Funciona
                            </Link>
                            <Link
                                href="/#pricing"
                                className="text-gray-700 hover:text-primary transition-colors font-medium"
                                onClick={() => setIsOpen(false)}
                            >
                                Planos
                            </Link>

                            {user ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors font-medium"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <User className="w-5 h-5" />
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleSignOut();
                                            setIsOpen(false);
                                        }}
                                        className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors font-medium text-left"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Sair
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors font-medium"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <LogIn className="w-5 h-5" />
                                        Login
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all text-center"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Começar Grátis
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

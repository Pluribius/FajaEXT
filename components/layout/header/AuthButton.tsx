'use client';

import { LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '@/components/context/AuthContext';

interface AuthButtonProps {
    isMobile?: boolean;
    isTransparent?: boolean;
    onClick?: () => void;
}

export const AuthButton = ({ isMobile = false, isTransparent = false, onClick }: AuthButtonProps) => {
    const { user, logout, loading } = useAuth();

    const baseStyles = "flex items-center gap-2 font-bold uppercase tracking-widest transition-all active:scale-95 cursor-pointer";
    const desktopStyles = "text-xs bg-neon text-white px-5 py-2.5 rounded-full hover:shadow-[0_0_15px_rgba(0,180,216,0.4)]";
    const mobileStyles = "text-xl text-foreground mt-4 text-left w-full flex items-center justify-between";

    if (loading) {
        return (
            <div className="w-8 h-8 rounded-full border border-foreground/10 animate-pulse bg-foreground/5" />
        );
    }

    if (user) {
        const loggedInDesktopStyles = isTransparent
            ? "flex items-center gap-2 p-2 rounded-full border border-white/20 text-white cursor-pointer hover:bg-white/5 transition-all"
            : "flex items-center gap-2 p-2 rounded-full border border-foreground/10 text-foreground cursor-pointer hover:bg-foreground/5 transition-all";

        return (
            <div className={isMobile ? "w-full flex flex-col gap-3" : "flex items-center gap-4"}>
                <div className={isMobile ? "flex items-center gap-3 py-2 text-foreground" : loggedInDesktopStyles}>
                    <User size={20} />
                    {!isMobile && (
                        <span className="text-xs font-bold tracking-wider max-w-[120px] truncate pr-2">
                            {user.full_name || user.email.split('@')[0]}
                        </span>
                    )}
                    {isMobile && (
                        <span className="text-sm font-medium text-foreground/80">
                            {user.full_name || user.email}
                        </span>
                    )}
                </div>
                
                <button 
                    onClick={logout}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-400/70 hover:text-red-400 transition-colors cursor-pointer"
                >
                    <LogOut size={14} />
                    <span>Salir</span>
                </button>
            </div>
        );
    }

    return (
        <button onClick={onClick} className={isMobile ? mobileStyles : `${baseStyles} ${desktopStyles}`}>
            <LogIn size={16} />
            <span>Entrar</span>
        </button>
    );
};
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div 
            className="flex min-h-screen flex-col items-center justify-start pt-80"
            style={{
                backgroundImage: 'url(/images/gedung-oetomo.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="absolute inset-0 bg-slate-900/30"></div>
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-full overflow-hidden bg-white/95 backdrop-blur-md px-6 py-6 shadow-2xl sm:max-w-md sm:rounded-2xl">
                    {children}
                </div>
                <footer className="mt-6 text-center text-xs text-white">
                    2026 @ Informasi Teknologi Oetomo
                </footer>
            </div>
        </div>
    );
}

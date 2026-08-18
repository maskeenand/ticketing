import ApplicationLogo from '@/Components/ApplicationLogo';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-gray-700 text-slate-900">
            <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
                <div className="relative hidden md:block">
                    <img
                        src="/images/gedung-oetomo.jpg"
                        alt="Oetomo Hospital"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                </div>

                <div className="flex items-center justify-center px-6 py-12 sm:px-10">
                    <div className="w-full max-w-xl">
                        <div className="flex justify-center mb-10">
                            <ApplicationLogo className="h-20 w-auto" />
                        </div>
                        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-2xl shadow-slate-950/10">
                            {children}
                        </div>
                        <footer className="mt-6 text-center text-sm text-slate-500">
                            2026 @ (DK) Teknologi Informasi Oetomo
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}

import ApplicationLogo from '@/Components/ApplicationLogo';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-[#3b4a57] text-slate-900">
            <div className="grid min-h-screen grid-cols-1 md:grid-cols-[1.08fr_0.92fr]">
                <div className="relative hidden md:block overflow-hidden">
                    <img
                        src="/images/oetomo-hopital.jpg"
                        alt="Hospital front building"
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="eager"
                        draggable={false}
                    />
                </div>

                <div className="flex items-center justify-center px-5 py-8 sm:px-8 lg:px-10">
                    <div className="w-full max-w-[560px]">
                        <div className="mb-8 flex justify-center">
                            <div className="flex items-center gap-3">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-teal-400/70 bg-white/10 backdrop-blur-sm">
                                    <ApplicationLogo variant="icon" className="h-14 w-14" />
                                </div>
                                <div className="text-center leading-none text-teal-200">
                                    <div className="text-[10px] font-bold tracking-[0.28em]">
                                        TICKETING
                                    </div>
                                    <div className="mt-1 text-[10px] font-bold tracking-[0.2em] text-teal-100/90">
                                        HELPDESK
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-7 shadow-2xl shadow-slate-950/10 sm:p-8">
                            {children}
                        </div>

                        <footer className="mt-6 text-center text-sm text-slate-300">
                            2026 © (DK) Teknologi Informasi Oetomo
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}

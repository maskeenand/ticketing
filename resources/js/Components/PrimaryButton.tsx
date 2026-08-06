import { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center gap-2 rounded-2xl border border-transparent bg-gradient-to-r from-teal-500 to-cyan-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-500/30 transition-all duration-200 hover:from-teal-600 hover:to-cyan-700 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 active:from-teal-700 active:to-cyan-800 ${
                    disabled && 'opacity-50 cursor-not-allowed'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}

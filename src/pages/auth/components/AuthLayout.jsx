import { useState } from 'react';
import CircularIllustration from '../../../components/auth/CircularIllustration';
import AboutCirculappModal from '../../../components/auth/AboutCirculappModal';
import BrandLogo from '../../../components/common/BrandLogo';

export default function AuthLayout({
    children,
    title,
    subtitle,
    error,
}) {
    const [showAboutModal, setShowAboutModal] = useState(false);

    return (
        <>
            <div
                className="
                    relative
                    flex min-h-screen
                    items-center justify-center
                    overflow-hidden
                    bg-gradient-hero
                    p-4 sm:p-6 md:p-8
                "
            >
                {/* Blob decorativo superior izquierdo */}
                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none
                        absolute
                        -left-20
                        -top-20
                        h-80
                        w-80
                        rounded-full
                        bg-white
                        opacity-[0.04]
                        max-[480px]:hidden
                    "
                />

                {/* Blob decorativo inferior derecho */}
                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none
                        absolute
                        -bottom-16
                        -right-16
                        h-96
                        w-96
                        rounded-full
                        bg-primary-light
                        opacity-[0.08]
                        max-[480px]:hidden
                    "
                />

                {/* Dual-Pane Card */}
                <div
                    className="
                        relative
                        z-10
                        w-full
                        max-w-[880px]
                        rounded-3xl
                        bg-white
                        shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)]
                        overflow-hidden
                        grid grid-cols-1 md:grid-cols-12
                        animate-slide-up
                        border border-white/20
                    "
                >
                    {/* Left Column (Circular Illustration) */}
                    <div className="hidden md:block md:col-span-5 h-full">
                        <CircularIllustration onOpenAbout={() => setShowAboutModal(true)} />
                    </div>

                    {/* Right Column (Auth Form) */}
                    <div className="col-span-1 md:col-span-7 p-6 sm:p-8 md:p-9 flex flex-col justify-center">
                        {/* Logo */}
                        <div className="mb-3 flex justify-center">
                            <BrandLogo variant="symbol" size="lg" />
                        </div>

                        {/* Header */}
                        <div className="mb-4 text-center">
                            <h1
                                className="
                                    text-2xl
                                    font-bold
                                    text-gray-900
                                    m-0
                                    leading-tight
                                "
                            >
                                {title}
                            </h1>

                            {subtitle && (
                                <p className="text-xs sm:text-sm text-gray-500 mt-1 m-0">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        {/* Error */}
                        {error && (
                            <div
                                role="alert"
                                className="
                                    mb-3.5
                                    flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-rose-200
                                    bg-rose-50
                                    px-3.5
                                    py-2.5
                                    text-xs
                                    text-rose-700
                                "
                            >
                                <span className="font-bold">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Content */}
                        {children}

                        {/* Mobile "Sobre ComunaRed" link */}
                        <div className="mt-3.5 md:hidden text-center">
                            <button
                                type="button"
                                onClick={() => setShowAboutModal(true)}
                                className="inline-flex items-center gap-1.5 text-xs text-[#0F6E56] font-semibold bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-200 transition-colors cursor-pointer"
                            >
                                <span>ℹ️</span> ¿De qué trata ComunaRed?
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Informative Modal: ¿De qué trata Circulapp? */}
            <AboutCirculappModal
                isOpen={showAboutModal}
                onClose={() => setShowAboutModal(false)}
            />
        </>
    );
}
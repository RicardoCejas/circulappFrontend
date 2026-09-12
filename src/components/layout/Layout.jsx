import { useState, useEffect } from "react";
import Navbar from "./navbar/Navbar";
import Footer from "./Footer";
import AuthModal from "../auth/AuthModal";
import ErrorToast from "../feedback/ErrorToast";
import FeedbackModal from "../feedback/FeedbackModal";
import BetaTestingDrawer from "../feedback/BetaTestingDrawer";

const Layout = ({ children }) => {
  const [globalError, setGlobalError] = useState("");
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isBetaDrawerOpen, setIsBetaDrawerOpen] = useState(false);

  useEffect(() => {
    const handleGlobalError = (e) => {
      setGlobalError(e.detail?.message || "Ocurrió un error inesperado.");
      setTimeout(() => setGlobalError(""), 6000);
    };

    const handleOpenFeedback = () => setIsFeedbackOpen(true);
    const handleOpenBeta = () => setIsBetaDrawerOpen(true);

    window.addEventListener("app-global-error", handleGlobalError);
    window.addEventListener("open-feedback-modal", handleOpenFeedback);
    window.addEventListener("open-beta-drawer", handleOpenBeta);

    return () => {
      window.removeEventListener("app-global-error", handleGlobalError);
      window.removeEventListener("open-feedback-modal", handleOpenFeedback);
      window.removeEventListener("open-beta-drawer", handleOpenBeta);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar />

      <main className="flex-grow">
        {children}
      </main>

      <Footer />

      {/* Pestaña Lateral Fija (Fixed Vertical Tab en el Borde Derecho) */}
      <button
        type="button"
        onClick={() => setIsBetaDrawerOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-[#0F6E56] hover:bg-[#0c5946] text-white py-3 px-1.5 sm:px-2 rounded-l-2xl shadow-xl flex flex-col items-center gap-2 transition-all hover:pr-2.5 cursor-pointer border-t border-b border-l border-emerald-300/40 select-none group"
        title="Probando Avances: Testeo de nuevas funciones y reportes"
      >
        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs group-hover:scale-110 transition-transform">
          <i className="ti ti-flask text-sm" />
        </span>
        <span
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          className="text-[11px] font-bold tracking-widest uppercase text-emerald-100 group-hover:text-white transition-colors"
        >
          Probando Avances
        </span>
      </button>

      {/* Modal Simplificado de Feedback */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      {/* Panel Deslizante de Testing y Avances */}
      <BetaTestingDrawer
        isOpen={isBetaDrawerOpen}
        onClose={() => setIsBetaDrawerOpen(false)}
        onOpenGeneralFeedback={() => setIsFeedbackOpen(true)}
      />

      {/* Notificación flotante de error global (P-006) */}
      <ErrorToast error={globalError} onClose={() => setGlobalError("")} />

      {/* Modal global de bienvenida / autenticación */}
      <AuthModal />
    </div>
  );
};

export default Layout;
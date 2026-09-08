import welcomeBannerImg from '../../assets/circulapp-welcome.png';

export default function CircularIllustration({ onOpenAbout }) {
  return (
    <div className="relative flex flex-col items-center justify-between h-full min-h-[480px] p-6 lg:p-8 bg-[#507E74] text-white select-none overflow-hidden">
      {/* Top spacer / subtle branding pill */}
      <div className="relative z-10 w-full flex justify-center pt-2">
        <span className="text-[11px] font-semibold tracking-widest uppercase text-white/90 px-3.5 py-1 rounded-full bg-black/15 border border-white/20">
          ComunaRed · Comunidad Circular
        </span>
      </div>

      {/* Graphic Illustration */}
      <div className="relative z-10 w-full max-w-[280px] lg:max-w-[310px] my-auto flex items-center justify-center py-4">
        <img
          src={welcomeBannerImg}
          alt="Economía Circular ComunaRed"
          className="w-full h-auto max-h-[320px] object-contain pointer-events-none transition-transform duration-300 hover:scale-[1.02]"
        />
      </div>

      {/* Interactive button at the bottom */}
      <div className="relative z-20 w-full pb-2 flex justify-center">
        <button
          type="button"
          onClick={onOpenAbout}
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#194b3c] hover:bg-gray-50 hover:text-[#0F6E56] text-xs font-bold shadow-lg shadow-black/15 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 border border-white/40"
        >
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#194b3c] group-hover:bg-[#0F6E56] text-white text-[10px] font-bold transition-colors">
            i
          </span>
          <span>¿De qué trata ComunaRed?</span>
        </button>
      </div>
    </div>
  );
}


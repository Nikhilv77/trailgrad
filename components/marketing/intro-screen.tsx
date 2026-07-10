export function IntroScreen({ scene }: { scene: number }) {
  const hidden = scene >= 3;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-50 grid place-items-center bg-[#eafffb]/95 transition-opacity duration-700 ${
        hidden ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(45,212,191,0.24),transparent_42%)]" />

      <div className="relative z-10 flex min-h-[150px] w-full items-center justify-center px-6 text-center">
        <h2
          className={`absolute max-w-[820px] text-[34px] font-semibold leading-[1.1] tracking-[-0.035em] text-[#063b3b] transition-opacity duration-700 sm:text-[56px] ${
            scene === 1 ? "opacity-100" : "opacity-0"
          }`}
        >
          Don&apos;t get rejected in interviews.
        </h2>

        <h2
          className={`absolute max-w-[820px] text-[36px] font-semibold leading-[1.1] tracking-[-0.035em] text-[#063b3b] transition-opacity duration-700 sm:text-[60px] ${
            scene === 2 ? "opacity-100" : "opacity-0"
          }`}
        >
          Try <span className="text-[#0f9f8c]">Trailgrad.</span>
        </h2>
      </div>
    </div>
  );
}

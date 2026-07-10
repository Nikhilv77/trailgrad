export function TealBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#eafffb_0%,#f0fffd_44%,#fbfffe_100%)]" />
      <div className="absolute left-[-180px] top-[-160px] h-[460px] w-[460px] rounded-full bg-[#9be7dc]/38 blur-[80px]" />
      <div className="absolute right-[-180px] top-[40px] h-[430px] w-[430px] rounded-full bg-[#b6f2e8]/42 blur-[80px]" />
      <div className="absolute bottom-[-220px] left-1/2 h-[460px] w-[680px] -translate-x-1/2 rounded-full bg-[#d7fbf3]/65 blur-[90px]" />
    </div>
  );
}

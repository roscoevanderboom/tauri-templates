export default function HydrationElement() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#1e1e1e] text-[#e0e0e0] font-mono z-[9999]">
      <style>
        {`
          @keyframes indeterminate {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
          .animate-indeterminate {
            animation: indeterminate 1.5s infinite ease-in-out;
          }
        `}
      </style>
      <div className="flex flex-col items-center gap-6">
        <div className="w-[60px] h-[60px] border-4 border-white/10 border-l-[#00f2fe] rounded-full animate-spin"></div>
        <h2 className="text-2xl font-semibold tracking-wide flex items-center after:content-['...'] after:animate-pulse">
          Initializing IDE
        </h2>
        <div className="w-[200px] h-1 bg-white/10 rounded overflow-hidden mt-2">
          <div className="h-full w-1/2 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] rounded animate-indeterminate"></div>
        </div>
        <p className="text-sm text-[#888] m-0">Booting WebContainer...</p>
      </div>
    </div>
  );
}

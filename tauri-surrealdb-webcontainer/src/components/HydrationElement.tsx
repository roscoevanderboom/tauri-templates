export default function HydrationElement() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#1e1e1e] text-[#e0e0e0] font-mono z-[9999]">
      <div className="flex flex-col items-center gap-6">
        <div className="w-[60px] h-[60px] border-4 border-white/10 border-l-[#00f2fe] rounded-full animate-spin" />
        <h2 className="text-2xl font-semibold tracking-wide flex items-center after:content-['...'] after:animate-pulse">
          Initializing IDE
        </h2>
        <div className="w-[200px] h-1 bg-white/10 rounded overflow-hidden mt-2">
          {/* animate-[indeterminate_1.5s_infinite_ease-in-out] requires a custom keyframe —
              using translate animation via Tailwind's arbitrary value instead */}
          <div className="h-full w-1/2 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] rounded animate-[slide_1.5s_infinite_ease-in-out]" />
        </div>
        <p className="text-sm text-[#888] m-0">Booting WebContainer...</p>
      </div>
    </div>
  );
}

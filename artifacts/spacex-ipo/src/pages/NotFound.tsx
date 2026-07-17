import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050a0f] flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-8xl font-display font-bold text-white tracking-widest">404</h1>
        <p className="text-xl text-white/60 font-sans max-w-md mx-auto">
          The trajectory you're looking for doesn't exist. Signal lost.
        </p>
        <div className="pt-8">
          <Link href="/" className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-white/20 bg-transparent hover:bg-white/10 text-white font-bold uppercase tracking-widest font-display h-12 px-6 py-2">
            Return to Base
          </Link>
        </div>
      </div>
    </div>
  );
}

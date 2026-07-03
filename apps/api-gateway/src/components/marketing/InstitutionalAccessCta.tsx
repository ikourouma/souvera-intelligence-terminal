import Link from 'next/link';

interface Props {
  className?: string;
}

export function InstitutionalAccessCta({ className = '' }: Props) {
  return (
    <section className={`py-24 bg-[#121821]/30 border-t border-zinc-800 ${className}`}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 text-center">
        <h2
          className="text-3xl md:text-4xl font-bold mb-6 text-white"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Ready to access institutional intelligence?
        </h2>
        <p className="text-zinc-400 mb-10 max-w-xl mx-auto">
          Join governments, development finance institutions, and global enterprises leveraging Souvera for strategic decision-making.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/access/request-access"
            className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm"
          >
            Request Access
          </Link>
          <Link
            href="/contact"
            className="px-10 py-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm"
          >
            Contact Sales
          </Link>
        </div>
      </div>
    </section>
  );
}

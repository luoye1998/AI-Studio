/** 空状态插画：与 design/assets/empty-*.svg 同源，内联以省一次请求 */

export type IllustrationKind = 'pipeline' | 'assets' | 'shots' | 'budget' | 'knowledge';

export default function Illustration({ kind, width = 220 }: { kind: IllustrationKind; width?: number }) {
  const common = { fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg viewBox="0 0 480 320" width={width} height={(width * 320) / 480} aria-hidden style={{ opacity: 0.9 }}>
      {kind === 'pipeline' && (
        <>
          <g {...common} stroke="#2A3140" strokeWidth={1.5}>
            <path d="M60 200h360" strokeDasharray="6 8" />
            <path d="M182 183h40M308 183h40" strokeDasharray="4 6" />
            <circle cx="414" cy="183" r="14" strokeDasharray="4 6" />
          </g>
          <g {...common}>
            <rect x="96" y="150" width="86" height="66" rx="10" fill="#0D1016" stroke="#E0B055" strokeOpacity=".55" strokeWidth={1.6} />
            <rect x="222" y="150" width="86" height="66" rx="10" fill="#0D1016" stroke="#2A3140" strokeDasharray="5 6" />
            <rect x="348" y="150" width="60" height="66" rx="10" fill="#0D1016" stroke="#2A3140" strokeDasharray="5 6" />
            <path d="M118 176h42M118 188h28" stroke="#E0B055" strokeOpacity=".55" strokeWidth={1.6} />
          </g>
        </>
      )}
      {kind === 'assets' && (
        <g {...common}>
          <rect x="88" y="96" width="96" height="128" rx="10" fill="#0D1016" stroke="#E0B055" strokeOpacity=".5" strokeWidth={1.5} />
          <circle cx="136" cy="132" r="11" stroke="#E0B055" strokeOpacity=".5" strokeWidth={1.5} />
          <rect x="200" y="96" width="96" height="128" rx="10" fill="#0D1016" stroke="#2A3140" strokeDasharray="5 6" />
          <rect x="312" y="96" width="96" height="128" rx="10" fill="#0D1016" stroke="#2A3140" strokeDasharray="5 6" />
          <path d="M112 168c8-14 18-21 24-21s16 7 24 21" stroke="#3A4354" strokeDasharray="4 6" />
        </g>
      )}
      {kind === 'shots' && (
        <g {...common}>
          <rect x="60" y="118" width="360" height="84" rx="12" fill="#0D1016" stroke="#3A4354" strokeWidth={1.5} />
          <path d="M60 142h360M60 178h360" stroke="#232A36" strokeWidth={1.5} />
          <rect x="84" y="130" width="56" height="60" rx="6" stroke="#2A3140" strokeWidth={1.5} strokeDasharray="4 6" />
          <rect x="156" y="130" width="56" height="60" rx="6" stroke="#2A3140" strokeWidth={1.5} strokeDasharray="4 6" />
          <rect x="228" y="130" width="56" height="60" rx="6" stroke="#2A3140" strokeWidth={1.5} strokeDasharray="4 6" />
          <rect x="300" y="130" width="56" height="60" rx="6" stroke="#3A4354" strokeWidth={1.5} />
          <path d="M316 148l16 9-16 9z" fill="#E0B055" fillOpacity=".5" />
        </g>
      )}
      {kind === 'budget' && (
        <g {...common}>
          <path d="M72 236h336M72 236V96" stroke="#2A3140" strokeWidth={1.5} />
          <rect x="104" y="188" width="42" height="48" rx="6" stroke="#2A3140" strokeWidth={1.5} strokeDasharray="4 6" />
          <rect x="176" y="164" width="42" height="72" rx="6" stroke="#2A3140" strokeWidth={1.5} strokeDasharray="4 6" />
          <rect x="248" y="206" width="42" height="30" rx="6" stroke="#2A3140" strokeWidth={1.5} strokeDasharray="4 6" />
          <rect x="320" y="140" width="42" height="96" rx="6" stroke="#2A3140" strokeWidth={1.5} strokeDasharray="4 6" />
          <path d="M104 188l72-2 72 44 72-66" stroke="#E0B055" strokeOpacity=".45" strokeWidth={1.6} strokeDasharray="6 6" />
        </g>
      )}
      {kind === 'knowledge' && (
        <g {...common}>
          <path d="M96 96h116v140H96z" fill="#0D1016" stroke="#E0B055" strokeOpacity=".5" strokeWidth={1.5} />
          <path d="M212 96l60-22v140l-60 22" fill="#0D1016" stroke="#3A4354" strokeWidth={1.5} />
          <path d="M120 126h68M120 148h68M120 170h44" stroke="#2A3140" strokeWidth={1.5} strokeDasharray="4 6" />
          <path d="M232 118v96" stroke="#232A36" strokeWidth={1.5} />
        </g>
      )}
    </svg>
  );
}

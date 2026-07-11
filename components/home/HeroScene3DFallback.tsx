export function HeroScene3DFallback() {
  return (
    <div
      className="h-full w-full flex items-center justify-center"
      style={{
        background:
          'radial-gradient(circle at 50% 50%, rgba(44,76,126,0.35) 0%, rgba(44,76,126,0.08) 35%, transparent 70%)',
      }}
      aria-hidden="true"
    >
      <svg width="58%" viewBox="0 0 21 21" fill={'#111111'} xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0h7v7H0zM2 2h3v3H2zM14 0h7v7h-7zM16 2h3v3h-3zM0 14h7v7H0zM2 16h3v3H2z" />
        <rect x="8" y="0" width="2" height="2" />
        <rect x="11" y="3" width="2" height="2" />
        <rect x="0" y="8" width="2" height="2" />
        <rect x="3" y="10" width="2" height="2" />
        <rect x="8" y="8" width="2" height="2" />
        <rect x="13" y="8" width="2" height="2" />
        <rect x="18" y="10" width="2" height="2" />
        <rect x="8" y="13" width="2" height="2" />
        <rect x="11" y="18" width="2" height="2" />
        <rect x="16" y="13" width="2" height="2" />
        <rect x="13" y="16" width="2" height="2" />
        <rect x="18" y="16" width="2" height="2" />
      </svg>
    </div>
  );
}

export default HeroScene3DFallback;

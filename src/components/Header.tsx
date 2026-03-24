export default function Header() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4"
      style={{
        height: 64,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0px 2px 20px rgba(0,0,0,0.06)",
      }}
    >
      <img
        src="/logo/logo.svg"
        alt="Expert Radiology"
        className="h-[36px] sm:h-[44px]"
      />
    </header>
  );
}

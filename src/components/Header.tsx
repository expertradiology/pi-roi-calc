export default function Header() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center"
      style={{
        height: 60,
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0px 5px 100px 0px rgba(0,0,0,0.08)",
      }}
    >
      <img
        src="/logo/logo.svg"
        alt="Expert Radiology"
        style={{ height: 36 }}
      />
    </header>
  );
}

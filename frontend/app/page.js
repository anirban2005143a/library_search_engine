import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <Link
        href="/search"
        className="rounded-lg border px-6 py-4 text-xl font-semibold transition hover:-translate-y-0.5"
        style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)", boxShadow: "var(--shadow-sm)" }}
      >
        Go to Search Page
      </Link>
    </main>
  );
}


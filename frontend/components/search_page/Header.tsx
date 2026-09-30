import { BookOpen } from "lucide-react";

export default function Header() {
  return (
    <header className="flex items-center gap-3">
      <BookOpen size={28} className="text-primary" aria-hidden="true" />
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Library Search
      </h1>
    </header>
  );
}
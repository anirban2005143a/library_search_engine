import { BookOpen } from "lucide-react";

export default function Header() {
  return (
    <header className="flex flex-col items-center text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/10">
        <BookOpen size={27} aria-hidden="true" />
      </div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
        Find your next read
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Library Search
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
        Explore the catalog by title, author, subject, and more.
      </p>
    </header>
  );
}
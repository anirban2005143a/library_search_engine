"use client";

import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Calendar,
  ExternalLink,
  Globe,
  Hash,
  LibraryBig,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Loader from "../Loader";
import { parseBookCategories, type BookMetadata } from "@/utils/books.utils";

const hasValue = (value: unknown): value is string | number =>
  (typeof value === "string" && value.trim() !== "") || typeof value === "number";

function DetailField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number | null | undefined;
  icon: LucideIcon;
}) {
  if (!hasValue(value)) return null;

  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl bg-muted/40 p-4">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
        <dd className="mt-1 break-words text-sm font-medium text-foreground">{value}</dd>
      </div>
    </div>
  );
}

const BookDetailPage = () => {
  const [book, setBook] = useState<BookMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const params = useParams();
  const rawId = params?.id;
  const categories = parseBookCategories(book?.categories);

  useEffect(() => {
    if (typeof rawId !== "string") {
      setLoadError("A valid book ID was not provided.");
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const loadBook = async () => {
      setIsLoading(true);
      setLoadError("");
      setBook(null);
      try {
        const response = await axios.get<{ book: BookMetadata | null }>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/books/${encodeURIComponent(rawId)}`,
          { signal: controller.signal },
        );
        setBook(response.data?.book ?? null);
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          const message = axios.isAxiosError<{ message?: string }>(error)
            ? error.response?.data?.message || error.message
            : error instanceof Error
              ? error.message
              : "Unable to load this book.";
          setLoadError(message);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void loadBook();
    return () => controller.abort();
  }, [rawId]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <Loader text="Loading book details..." />
      </main>
    );
  }

  if (!book) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <section className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-lg sm:p-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="h-8 w-8" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {loadError ? "Unable to load book" : "Book not found"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {loadError || "This book may have been removed or the link may be incorrect."}
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to catalog
          </Link>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg py-2 pr-3 text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to catalog
          </Link>
          <span className="ml-auto inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <LibraryBig className="h-4 w-4" aria-hidden="true" />
            Book record
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid gap-8 md:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.7fr)] md:gap-10">
          <aside className="space-y-5">
            <div className="mx-auto max-w-sm overflow-hidden rounded-3xl border border-border/70 bg-card p-4 shadow-xl shadow-foreground/5 md:sticky md:top-24">
              <div className="overflow-hidden rounded-2xl bg-muted/50">
                {hasValue(book.thumbnail) ? (
                  <img
                    src={book.thumbnail}
                    alt={book.title ? `Cover of ${book.title}` : "Book cover"}
                    className="aspect-[3/4] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[3/4] flex-col items-center justify-center gap-4 bg-gradient-to-br from-primary/15 via-secondary to-muted p-8 text-center">
                    <BookOpen className="h-14 w-14 text-primary/70" aria-hidden="true" />
                    <span className="text-lg font-semibold text-foreground/80">
                      {book.title || "Book"}
                    </span>
                  </div>
                )}
              </div>
              {hasValue(book.link) && (
                <a
                  href={book.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  Read or purchase
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              {hasValue(book.id) && (
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Hash className="h-3.5 w-3.5" aria-hidden="true" />
                  Catalog ID: <span className="font-mono">{book.id}</span>
                </p>
              )}
            </div>
          </aside>

          <article className="min-w-0 space-y-8">
            <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Library collection
              </p>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                {book.title || "Untitled book"}
              </h1>
              {hasValue(book.author) && (
                <p className="mt-3 text-base text-muted-foreground">
                  by <span className="font-semibold text-foreground">{book.author}</span>
                </p>
              )}
              {categories.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-2" aria-label="Book categories">
                  {categories.map((category) => (
                    <li
                      key={category.toLowerCase()}
                      className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
                    >
                      {category}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {hasValue(book.description) && (
              <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
                  About this book
                </h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-base">
                  {book.description}
                </p>
              </section>
            )}

            <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
              <h2 className="mb-5 text-lg font-semibold text-foreground">Book details</h2>
              <dl className="grid gap-3 sm:grid-cols-2">
                <DetailField label="Publisher" value={book.publisher} icon={Building2} />
                <DetailField label="Published" value={book.published_year} icon={Calendar} />
                <DetailField label="Language" value={book.language} icon={Globe} />
                <DetailField label="Pages" value={book.pages} icon={BookOpen} />
                <DetailField label="ISBN" value={book.isbn} icon={Hash} />
                <DetailField label="Catalog ID" value={book.id} icon={Hash} />
              </dl>
            </section>
          </article>
        </div>
      </main>
    </div>
  );
};

export default BookDetailPage;

import axios from "axios";

export interface BookMetadata {
  title?: string | null;
  author?: string | null;
  publisher?: string | null;
  language?: string | null;
  published_year?: string | null;
  categories?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  pages?: string | number | null;
  link?: string | null;
  isbn?: string | null;
  id?: string | null;
}

export interface BookSearchHit {
  _id: string;
  _source: BookMetadata;
}

export interface BookSearchResponse {
  books: BookSearchHit[];
  error?: boolean;
  message?: string;
}

export type BookSearchErrorKind = "network" | "timeout" | "server" | "request";

export class BookSearchError extends Error {
  constructor(
    message: string,
    public readonly kind: BookSearchErrorKind,
  ) {
    super(message);
    this.name = "BookSearchError";
  }
}

export const parseBookCategories = (categories?: string | null): string[] => {
  const seen = new Set<string>();

  return (categories ?? "")
    .split(",")
    .map((category) => category.trim())
    .filter((category) => {
      const normalizedCategory = category.toLowerCase();
      if (!category || seen.has(normalizedCategory)) return false;
      seen.add(normalizedCategory);
      return true;
    });
};

export const searchBooks = async (
  search_query: string,
  intent: string,
  k = 20,
): Promise<BookSearchResponse> => {
  try {
    const response = await axios.post<BookSearchResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/books/search`,
      { search_query, intent, k },
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
        throw new BookSearchError(
          "The search took too long to respond. Please try again.",
          "timeout",
        );
      }

      if (error.code === "ERR_NETWORK" || !error.response) {
        throw new BookSearchError(
          "We couldn’t connect to the library service. Check that the backend is running and try again.",
          "network",
        );
      }

      if (error.response.status >= 500) {
        throw new BookSearchError(
          "The library service is having trouble right now. Please try again in a little while.",
          "server",
        );
      }

      throw new BookSearchError(
        error.response.data?.message ||
          "We couldn’t process that search. Please check your query and try again.",
        "request",
      );
    }

    throw new BookSearchError(
      error instanceof Error
        ? error.message
        : "Something went wrong while searching. Please try again.",
      "request",
    );
  }
};

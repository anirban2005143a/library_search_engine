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
    const message = axios.isAxiosError<{ message?: string }>(error)
      ? error.response?.data?.message || error.message
      : error instanceof Error
        ? error.message
        : "Book search failed";
    throw new Error(message);
  }
};

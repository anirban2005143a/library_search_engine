import axios from "axios";

export interface BookSearchHit {
  _id: string;
  _source: Record<string, unknown>;
}

export interface BookSearchResponse {
  books: BookSearchHit[];
  error?: boolean;
  message?: string;
}

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

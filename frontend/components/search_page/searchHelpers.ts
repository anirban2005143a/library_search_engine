import { Book , FilterState} from "./types";


export const demoBooks: Book[] = [
  {
    id: 1,
    title: "The Night Library",
    thumbnail: "https://picsum.photos/200/300?random=1",
    rating: 4.6,
    readingLevel: "Intermediate",
    author: "Ava Collins",
    publisher: "Aurora Press",
    publishedYear: 2021,
    language: "English",
    categories: ["Fiction", "Adventure", "Fiction", "Adventure", "Fiction", "Adventure", "Fiction", "Adventure", "Fiction", "Adventure"],
    genre: "Adventure",
    isbn: "978-0451480427",
    format: "Hardcover",
    documentType: "Novel",
  },
  {
    id: 2,
    title: "Quantum Stories",
    thumbnail: "https://picsum.photos/200/300?random=2",
    rating: 4.2,
    readingLevel: "Advanced",
    author: "Liam Baker",
    publisher: "Nova Books",
    publishedYear: 2019,
    language: "English",
    categories: ["Science", "Non-fiction"],
    genre: "Science",
    isbn: "978-0143128571",
    format: "eBook",
    documentType: "Research",
  },
  {
    id: 3,
    title: "Beginner’s Guide to Astronomy",
    thumbnail: "https://picsum.photos/200/300?random=3",
    rating: 4.8,
    readingLevel: "Beginner",
    author: "Maya Singh",
    publisher: "Stellar House",
    publishedYear: 2023,
    language: "English",
    categories: ["Education", "Science"],
    genre: "Education",
    isbn: "978-1609839452",
    format: "Paperback",
    documentType: "Guide",
  },
  {
    id: 4,
    title: "Historical Atlas",
    thumbnail: "https://picsum.photos/200/300?random=4",
    rating: 4.4,
    readingLevel: "Intermediate",
    author: "Emma Li",
    publisher: "Historians’ Guild",
    publishedYear: 2018,
    language: "English",
    categories: ["History", "Reference"],
    genre: "History",
    isbn: "978-0525578115",
    format: "Hardcover",
    documentType: "Atlas",
  },
];


export const addFilterValue = (filterState: FilterState, key: keyof FilterState, value: string): FilterState => {
  if (!value || !value.trim()) return filterState;
  const normalized = value.trim();

  const existing = filterState[key] || [];
  if (existing.includes(normalized)) return filterState;

  return {
    ...filterState,
    [key]: [...existing, normalized],
  };
};

export const removeFilterValue = (filterState: FilterState, key: keyof FilterState, value: string): FilterState => {
  const existing = filterState[key] || [];
  const updated = existing.filter((it) => it !== value);
  return {
    ...filterState,
    [key]: updated,
  };
};

export const applyFilters = (
  books: Book[],
  filterState: FilterState,
  query: string
): Book[] => {
  const q = query.trim().toLowerCase();

  return books.filter((book) => {
    const matchesQuery =
      !q ||
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      book.publisher.toLowerCase().includes(q) ||
      book.isbn.toLowerCase().includes(q) ||
      book.categories.some((c) => c.toLowerCase().includes(q));

    if (!matchesQuery) return false;

    const criteria: [string[] | undefined, string][] = [
      [filterState.author, book.author],
      [filterState.genre, book.genre],
      [filterState.isbn, book.isbn],
      [filterState.format, book.format],
      [filterState.documentType, book.documentType],
      [filterState.readingLevel, book.readingLevel],
    ];

    return criteria.every(([values, fieldValue]) => {
      if (!values || values.length === 0) return true;
      return values.some((v) => fieldValue.toLowerCase().includes(v.toLowerCase()));
    });
  });
};
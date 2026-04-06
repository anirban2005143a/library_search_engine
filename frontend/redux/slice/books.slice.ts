"use client";
import { demoBooks } from "@/component/search_page/searchHelpers";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the shape of your state
interface CatalogueState {
  search_query: string;
  books: any;
  search_id: string;
  page_no: number;
  pageSize: number;
  filters: Record<string, any[]>;
  intent: string;
  searchType: string;
  isLoading: boolean;
  totalBooks: number;
  result_query: string;
  result_type: string;
}

// Initial state
const initialState: CatalogueState = {
  search_query: "",
  books: [],
  search_id: "",
  page_no: 1,
  pageSize: 10,
  filters: {},
  intent: "GENERAL_SEARCH",
  searchType: "All Fields",
  isLoading: false,
  totalBooks: 0,
  result_query: "",
  result_type: "All Fields",
};

// Create slice
const bookSlice = createSlice({
  name: "catalogue",
  initialState,
  reducers: {
    setBooks: (state, action: PayloadAction<{ books: typeof demoBooks }>) => {
      state.books = action.payload.books;
    },
    setIntent: (state, action: PayloadAction<{ intent: string }>) => {
      state.intent = action.payload.intent;
    },
    setSearchID: (state, action: PayloadAction<{ search_id: string }>) => {
      state.search_id = action.payload.search_id;
    },
    setIsLoading: (state, action: PayloadAction<{ isLoading: boolean }>) => {
      state.isLoading = action.payload.isLoading;
    },
    setFilters: (state, action: PayloadAction<{ field: string; value: any | any[] }>) => {
      let value = action.payload.value;
      if (!Array.isArray(value)) value = [value];
      state.filters[action.payload.field] = value;
    },
    setSearchQuery: (state, action: PayloadAction<{ search_query: string }>) => {
      state.search_query = action.payload.search_query;
    },
    setPageNo: (state, action: PayloadAction<{ page_no: number }>) => {
      state.page_no = action.payload.page_no;
    },
    setTotalBooks: (state, action: PayloadAction<{ totalBooks: number }>) => {
      state.totalBooks = action.payload.totalBooks;
    },
    setPageSize: (state, action: PayloadAction<{ pageSize: number }>) => {
      state.pageSize = action.payload.pageSize;
    },
    setSearchType: (state, action: PayloadAction<{ searchType: string }>) => {
      state.searchType = action.payload.searchType;
    },
    setResultQuery: (state, action: PayloadAction<{ result_query: string }>) => {
      state.result_query = action.payload.result_query;
    },
    setResultType: (state, action: PayloadAction<{ result_type: string }>) => {
      state.result_type = action.payload.result_type;
    },
  },
});

// Export actions and reducer
export const {
  setBooks,
  setIntent,
  setSearchID,
  setIsLoading,
  setFilters,
  setSearchQuery,
  setPageNo,
  setTotalBooks,
  setPageSize,
  setSearchType,
  setResultQuery,
  setResultType,
} = bookSlice.actions;

export default bookSlice.reducer;
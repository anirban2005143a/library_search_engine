import axios from "axios";

export const searchBooks = async (search_query:string , searchId:string , pageNo:number , intent:string) => {

    try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/books/search`, {
      search_query,
      searchId,
      pageNo,
      intent,
    });

    return response.data; // adjust if your API wraps data differently
  } catch (error: any) {
    console.error("Error searching books:", error?.response?.data?.message|| error.message);
    throw error;
  }

};

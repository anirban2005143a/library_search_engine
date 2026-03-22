import { two_pass_hybrid_search } from "../elasticsearch/searchBook.js";

export const searchBookBySearchQuery = async (req, res) => {
  try {
    const { search_query } = req.body;
    if (!search_query) {
      return res
        .status(400)
        .json({ error: true, message: "Search query required." });
    }
    const result = await two_pass_hybrid_search("whodunnit");

    return res.status(200).json({ result, error: false });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true, message: error.message });
  }
};

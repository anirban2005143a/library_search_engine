import { esClient } from "./insertDataIntoElasticSearch.js";

export const checkTitleExists = async (title) => {
  try {
    const response = await esClient.search({
      index: process.env.INDEX_NAME,
      size: 0, // We don't need the actual data, just the count
      query: {
        // Use "title.keyword" for exact case-sensitive match
        // Use "title" for a standard analyzed search
        match_phrase: {
          title: title,
        },
      },
    });

    // If total hits > 0, the title exists
    const total = response.hits.total.value;

    if (total > 0) {
      console.log(`✅ Found: "${title}" exists (${total} matches)`);
      return true;
    } else {
      console.log(`❌ Not Found: "${title}" does not exist.`);
      return false;
    }
  } catch (error) {
    console.error("Error checking title:", error.meta.body.error);
    return false;
  }
};

export const countResponse = async () => {
  const count = await esClient.count({
    index: "books",
  });
  return count;
};

export const VECTOR_GAP_SYNONYMS = [
  // --- Industry Shorthand (Vectors hate these) ---
  "ya, young adult, teen fiction",
  "mg, middle grade, tween",
  "pbk, paperback, softcover",
  "hbk, hardback, hardcover",
  "sf, sci-fi, science fiction",
  "bio, biography, autobiography",
  "non-fic, non-fiction, factual",
  "hist-fic, historical fiction",
  "fan-fic, fan fiction",

  // --- Genre Specific Slang ---
  "whodunnit, mystery, detective story",
  "chick-lit, women's fiction, romance",
  "space opera, sci-fi, galactic empire",
  "grimdark, dark fantasy, gritty fantasy",
  "cozy mystery, light mystery, amateur sleuth",

  // --- Searcher Intent (Bridge Phrases) ---
  "tbr, to be read, recommended books",
  "best-seller, popular books, top rated",
  "illustrated, illus, with pictures, graphic",
  "anthology, collection, short stories",

  "rom, love story, romance",                // Vectors often miss the "rom" shorthand
  "funny, comedy, humor, hilarious",         // Users search for "funny", tags say "Humor"
  "magic, wizardry, sorcery, spells",        // Bridges high-fantasy terms
  "scary, spooky, horror, thriller",         // Visual/Vibe terms to genre tags
  "period piece, historical drama, historical", // Common cinematic search terms
  "epic, saga, series, world-building",      // Broad intent to specific tag
  "paranormal, supernatural, urban fantasy", // Technical genre overlap
  "judaica, jewish fiction, jewish heritage",// Culture-specific shorthand
  "inspirational, religious, christian fiction", // Mood vs. Genre mapping
  "vampires, bloodsuckers, fangs"
];

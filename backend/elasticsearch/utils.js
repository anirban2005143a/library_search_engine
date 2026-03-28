import { connect_to_elastic_search, esClient } from "./elasticsearch.js";
import nlp from "compromise";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const indexName = process.env.INDEX_NAME;

export const checkTitleExists = async (title) => {
  try {
    const response = await esClient().search({
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

export const count_books_at_index = async () => {
  const count = await esClient().count({
    index: "books",
  });
  console.log(count);
  return count;
};

export const VECTOR_GAP_SYNONYMS = [
  // --- Industry Shorthand & Age Groups ---
  "ya, young adult, teen fiction, juvenile, teen",
  "mg, middle grade, tween, kids 8-12",
  "na, new adult, college age fiction",
  "pbk, paperback, softcover, mmpb",
  "hbk, hardback, hardcover",
  "arc, advanced reader copy, uncorrected proof",
  "pb, picture book, children's illustration",

  // --- Core Genre Shortcuts ---
  "sf, sci-fi, science fiction, scifi, space opera",
  "bio, biography, autobiography, memoir, life story",
  "non-fic, non-fiction, factual, real life",
  "hist-fic, historical fiction, histfic, period piece",
  "fan-fic, fan fiction, fanfic",
  "rom, romance, love story, spicy, steamy",
  "rom-com, romantic comedy, funny romance",
  "pnr, paranormal romance",
  "litrpg, progression fantasy, game world",
  "spec-fic, speculative fiction",
  "cli-fi, climate fiction, environmental fiction",
  "myth, mythology, legends, folklore",
  "dystopian, post-apocalyptic, end of the world, survival fiction",
  "utopian, ideal society, perfect world",
  "cyberpunk, high tech low life, dystopian tech",
  "steampunk, victorian sci-fi, steam powered",
  "space, outer space, interstellar, galactic",
  "time travel, time loop, temporal fiction",
  "alternate history, alt-history, reimagined past",

  // --- Fantasy Subgenres ---
  "high fantasy, epic fantasy, secondary world",
  "low fantasy, real world magic",
  "dark fantasy, horror fantasy",
  "sword and sorcery, heroic fantasy",
  "fairy tale, retelling, folklore adaptation",
  "dragons, dragon riders, fire breathers",

  // --- Mystery & Thriller Slang ---
  "whodunnit, mystery, detective story, crime, amateur sleuth",
  "cozy mystery, light mystery, gentle crime",
  "true-crime, non-fiction crime, real murder",
  "scary, spooky, horror, thriller, suspense",
  "grimdark, dark fantasy, gritty fantasy",

  // --- Format & Searcher Intent ---
  "audio, audiobook, listening, narrated",
  "ebk, ebook, digital book, kindle, epub",
  "graphic, comic, illustrated, manga, manhua, visual novel",
  "antho, anthology, collection, short stories",
  "tbr, to be read, recommended books",
  "best-seller, popular books, top rated",

  // --- Academic & Topic Shortcuts ---
  "bus, business, finance, money, wealth, investing",
  "poly, politics, political science, government",
  "psych, psychology, mental health, brain",
  "soc, sociology, social science, society",
  "hist, history, historical, past events",
  "med, medical, medicine, health",

  // --- Mood & Style (The "Vibe" Bridge) ---
  "funny, comedy, humor, hilarious, laugh",
  "dark, edgy, gritty, intense, bleak",
  "feel-good, heartwarming, uplifting, wholesome",
  "tear-jerker, sad, emotional, tragic",
  "page-turner, fast-paced, unputdownable, action",
  "magic, wizardry, sorcery, spells, witchcraft",
  "epic, saga, series, world-building",
  "paranormal, supernatural, urban fantasy, ghosts",
  "judaica, jewish fiction, jewish heritage",
  "inspirational, religious, christian fiction, spiritual",
  "vampires, bloodsuckers, fangs",

  // --- Romance Nuances ---
  "enemies to lovers, rivalry romance",
  "friends to lovers, slow burn romance",
  "love triangle, romantic conflict",
  "second chance romance, rekindled love",
  "forbidden love, taboo romance",
  "office romance, workplace love",

  // --- Thriller & Crime Extensions ---
  "legal thriller, courtroom drama, law fiction",
  "spy, espionage, secret agent, intelligence",
  "heist, robbery, con artist, crime caper",
  "serial killer, murder spree, psychopath",
  "noir, hardboiled, crime noir",

  // --- Horror Extensions ---
  "ghosts, haunted, paranormal horror",
  "zombies, undead, apocalypse horror",
  "body horror, grotesque, disturbing",
  "psychological horror, mind games, paranoia",

  // --- Non-Fiction Extensions ---
  "self-help, personal development, growth",
  "productivity, time management, efficiency",
  "startup, entrepreneurship, business building",
  "economics, macroeconomics, microeconomics",
  "philosophy, existentialism, ethics, logic",
  "science, scientific, research, discovery",
  "technology, tech, innovation, future",

  // --- Audience / Demographic Tags ---
  "kids, children, juvenile fiction",
  "teen, adolescent, coming of age",
  "adult fiction, general audience",
  "women's fiction, female leads",
  "lgbt, queer, LGBTQ+, diverse",

  // --- Format & Media Extensions ---
  "series, multi-book, saga, volumes",
  "standalone, single novel",
  "short read, novella, quick read",
  "long read, epic length",

  // --- Tone / Style Enhancements ---
  "slow burn, character driven",
  "plot driven, action heavy",
  "twisty, unpredictable, shocking",
  "light read, easy read",
  "heavy, deep, thought provoking",

  // --- Setting-Based Keywords ---
  "school, academy, campus",
  "war, military, battlefield",
  "historical setting, period drama",
  "urban, city life, metropolitan",
  "rural, countryside, village life",
  "island, remote, isolated",

  // --- Popular Tropes ---
  "chosen one, destiny, prophecy",
  "found family, group bond",
  "revenge, vengeance, justice",
  "survival, stranded, endurance",
  "quest, journey, adventure",
  "hidden identity, secret past",

  // --- Ultra-Short Genre Slang ---
  "fic, fiction, novel, story",
  "nf, nonfiction, factual",
  "adv, adventure, action",
  "thr, thriller, suspense",
  "hor, horror, scary",
  "fan, fantasy, magic",
  "mys, mystery, crime",
  "susp, suspense, tension",
  "lit, literature, literary fiction",

  // --- Book Community / Reader Slang ---
  "rec, recommendation, suggested read",
  "fav, favorite, top pick",
  "dnf, did not finish, dropped",
  "reco, recommend, suggestion",
  "insta-read, must read, highly recommended",
  "binge, binge-read, addictive",
  "hooked, gripping, engaging",

  // --- Format Shortcuts ---
  "hc, hardcover, hardback",
  "sc, softcover, paperback",
  "ill, illustrated, visuals",
  "ed, edition, version",
  "vol, volume, part",
  "omni, omnibus, collection",

  // --- Writing Style Shortcuts ---
  "fast, fast-paced, quick read",
  "slow, slow-paced, detailed",
  "char, character-driven, deep characters",
  "plot, plot-driven, story focused",
  "desc, descriptive, detailed writing",

  // --- Emotional / Vibe Slang ---
  "angst, emotional pain, drama",
  "fluff, light, feel-good",
  "smut, explicit romance, erotic",
  "wholesome, feel-good, uplifting",
  "darkfic, dark fiction, heavy themes",

  // --- Setting Shortcuts ---
  "hs, high school, teen setting",
  "uni, university, college",
  "wrk, workplace, office",
  "hist, historical setting, past era",
  "fut, futuristic, future setting",

  // --- Trope Shortcuts ---
  "otl, one true love, soulmate",
  "tri, love triangle, three-way romance",
  "sec, secret identity, hidden life",
  "enl, enemies to lovers",
  "ftl, friends to lovers",

  // --- Misc Reader Intent ---
  "top, top rated, best",
  "new, new release, latest",
  "old, classic, vintage",
  "award, award-winning, prize winner",
  "cult, cult classic, niche favorite",
];

export const cross_encoder_ranking = async (
  docs = [],
  cleanQuery,
  intent,
  topK = 30,
) => {
  if (!docs || !Array.isArray(docs) || docs.length == 0) {
    throw new Error("Please provide documents for cross encoder scoring");
  }

  // Format the documents into the optimized string we discussed
  const formattedDocs = docs.map((doc) => {
    // Use 500 chars to ensure the model gets enough context
    const summary =
      doc._source.description && doc._source.description.length > 500
        ? doc._source.description.slice(0, 500) + "..."
        : doc._source.description || "No description available.";
    let text =
      `TITLE: ${doc._source.title} | AUTHOR: ${doc._source.author} | CATEGORIES: ${doc._source.categories} | SUMMARY: ${summary}`.toLowerCase();
    if (intent === "ISBN_SEARCH") text += `ISBN:${doc._source.isbn}`;
    else if (intent === "YEAR_LOOKUP")
      text += `ISBN:${doc._source.published_year}`;

    return {
      id: doc._source.id,
      // This is the 'text' field your Python API expects
      text: text,
    };
  });

  try {
    const response = await axios.post(
      `${process.env.PYTHON_SERVER_URL}/cross-encoder`,
      {
        query: cleanQuery,
        documents: formattedDocs,
      },
    );

    const ce_scores = response.data; // Map of { doc_id: score }

    //  FINAL FUSION & SORTING ---
    const finalResults = docs.map((doc) => {
      const rrfScore = doc.rrf_ranking_score || doc.score || doc._score; // Score from your RRF function
      const ceScore = ce_scores[doc._id] || -10; // Default low if missing

      // 3. Harmonic Mean (Balanced Penalty)The Harmonic Mean is mathematically designed to be sensitive to the lowest value in a set. If either the CE score or the RRF score is very low, the final score will be low, regardless of how high the other one is.$$Score = 2 \times \frac{CE \times \text{normalizedRRF}}{CE + \text{normalizedRRF}}$$
      let combinedScore;
      if (intent == "FILTERING")
        combinedScore = ceScore + Math.pow(rrfScore, 0.5);
      combinedScore = ceScore * Math.log1p(rrfScore);

      let intentBonus = 0;
      const isSpecificField = [
        "TITLE_SEARCH",
        "AUTHOR_SEARCH",
        "PUBLISHER_SEARCH",
        "YEAR_SEARCH",
        // "ISBN_SEARCH",
      ].includes(intent.intent);
      if (isSpecificField) intentBonus = Math.log1p(rrfScore) * 0.5;

      // return
      return {
        ...doc,
        ce_score: ceScore,
        final_score: combinedScore + intentBonus,
      };
    });

    // Sort by final score descending
    const sortedResults = finalResults
      .sort((a, b) => (b.final_score || 0) - (a.final_score || 0))
      .slice(0, Math.max(1, topK));

    return sortedResults;
  } catch (error) {
    console.error("Cross-Encoder failed, falling back to RRF rankings:", error);
    throw new Error(error);
  }
};

export const RRF_ranking = async (results, topK, intent = "GENERAL_SEARCH") => {
  const Multi_Match = results?.[0]?.hits?.hits || [];
  const KNN_Query = results?.[1]?.hits?.hits || [];
  const KNN_Title_Seed = results?.[2]?.hits?.hits || [];
  const KNN_Context_Seed = results?.[3]?.hits?.hits || [];

  // console.log(
  //   Multi_Match.length,
  //   KNN_Query.length,
  //   KNN_Title_Seed.length,
  //   KNN_Context_Seed.length,
  // );
  try {
    const { data } = await axios.post(
      `${process.env.PYTHON_SERVER_URL}/rrf-rank`,
      {
        multi_match: slimHits(Multi_Match),
        knn_query: slimHits(KNN_Query),
        knn_title_seed: slimHits(KNN_Title_Seed),
        knn_context_seed: slimHits(KNN_Context_Seed),
        intent: intent,
      },
    );

    console.log(data);
    const scores = data.rerank_results;

    // -------- Step 1: Build doc map --------
    const allDocs = [
      ...Multi_Match,
      ...KNN_Query,
      ...KNN_Title_Seed,
      ...KNN_Context_Seed,
    ];

    const docMap = {};
    for (const doc of allDocs) {
      docMap[doc._id] = doc;
    }

    // -------- Step 2: Sort by score --------
    const sorted_docs_score = Object.entries(scores)
      .sort((a, b) => b[1] - a[1]) // descending
      .slice(0, topK); // take topK

    // -------- Step 3: Map back to full docs --------
    const finalResults = sorted_docs_score.map(([docId, score]) => ({
      ...docMap[docId],
      rrf_ranking_score: score, // attach new score
    }));

    return finalResults;
  } catch (error) {
    console.error("RRF ranking API error:", error.message);
    throw error;
  }
};

const slimHits = (hits) =>
  hits.map((hit, index) => ({
    _id: hit._id,
    _score: hit._score,
    rank: index + 1, // Important for RRF
  }));

export const maxGapCutoff = (
  docs,
  scores,
  { minDocs = 1, maxDocs = 15 } = {},
) => {
  // 1. Map docs and scores together for sorting
  const paired = docs.map((doc, i) => ({ ...doc, score: scores[i] }));

  // 2. Sort descending by score
  paired.sort((a, b) => b.score - a.score);

  // 3. Calculate gaps (only for the top candidates to avoid noise at the tail)
  const searchLimit = Math.min(paired.length, 25);
  let maxGap = -1;
  let cutoffIndex = minDocs;

  for (let i = 0; i < searchLimit - 1; i++) {
    const gap = paired[i].score - paired[i + 1].score;

    // Update if this is the largest gap found so far
    if (gap > maxGap) {
      maxGap = gap;
      cutoffIndex = i + 1; // Cut after the current document
    }
  }

  // 4. Enforce boundaries (don't return 0, don't return more than maxDocs)
  const finalIndex = Math.max(minDocs, Math.min(cutoffIndex, maxDocs));

  return paired.slice(0, finalIndex);
};

export const getSearchIntent = async (queryText) => {
  // await connect_to_elastic_search();

  // Deep clone the intent templates to avoid cross-request contamination
  const currentIntents = intents.map((i) => ({ ...i }));

  //cleaning query
  let cleanQuery;
  try {
    const res = await axios.post(
      `${process.env.PYTHON_SERVER_URL}/clean-query`,
      {
        query: queryText,
      },
    );
    cleanQuery = res.data;
  } catch (error) {
    console.log("Error while cleaning query text , ", error.message);
    queryText = queryText.toLowerCase();
    queryText = queryText.replace(/[^a-zA-Z0-9\s.\-]/g, "");
    queryText = queryText.replace(/\s+/g, " ").trim();
    cleanQuery = queryText;
  }

  // console.log(cleanQuery);
  //check for isbn
  if (strictIsbnRegex.test(queryText))
    return {
      cleanQuery: cleanQuery,
      intent: "ISBN_SEARCH",
      boosts: {
        title: 3,
        author: 2,
        description: 1,
        categories: 2,
        publisher: 1,
        isbn: 10,
        publisher: 1,
        published_year: 1,
      },
      targetVector: "title_embedding",
    };

  // console.log("not isbn");
  // do parallel matching
  const searchTasks = parallel_retrieval_for_intent(cleanQuery);
  const searchResults = await Promise.all(searchTasks);

  //add bm25 score to the intent array
  const intent_score_map = {
    TITLE_SEARCH: searchResults[0].hits?.hits?.[0]?._score || 0,
    AUTHOR_SEARCH: searchResults[1].hits?.hits?.[0]?._score || 0,
    PUBLISHER_SEARCH: searchResults[2].hits?.hits?.[0]?._score || 0,
    YEAR_SEARCH: searchResults[3].hits?.hits?.[0]?._score || 0,
    // ISBN_SEARCH: searchResults[4].hits?.hits?.[0]?._score || 0,
  };
  currentIntents.forEach((intent) => {
    const bm25_score = intent_score_map[intent.intent];
    intent.bm25_score = bm25_score || 0;
  });

  //formate document for cross encoder
  const formattedDocs = currentIntents.map((intent) => {
    return {
      id: intent.intent,
      text: intent.desc,
    };
  });

  //call cross encoder ranking api
  let ce_scores = undefined;
  try {
    const response = await axios.post(
      `${process.env.PYTHON_SERVER_URL}/cross-encoder`,
      {
        query: cleanQuery,
        documents: formattedDocs,
      },
    );
    ce_scores = response.data;
  } catch (error) {
    console.log("Error while cross encoder ranking for saeach intent:", error);
  }

  //final score calculation
  currentIntents.forEach((intent, index) => {
    const bm25Score = intent.bm25_score || 0;
    const bm25Norm = Math.log1p(bm25Score) / 5;
    const ceScore = ce_scores[intent.intent] || 0;

    const combinedScore =
      ceScore == 0
        ? bm25Norm
        : bm25Norm == 0
          ? ceScore
          : 2 * ((ceScore * bm25Norm) / (ceScore + bm25Norm));
    // console.log(intent.intent, bm25Score, ceScore, combinedScore);

    let intentBonus = 0;
    const isSpecificField = [
      "TITLE_SEARCH",
      "AUTHOR_SEARCH",
      "PUBLISHER_SEARCH",
      "YEAR_SEARCH",
    ].includes(intent.intent);
    if (isSpecificField && bm25Norm > 0.7) {
      intentBonus = Math.log1p(bm25Score) * 0.5; // Flat bonus for finding a real record match
    }
    if (!isSpecificField && bm25Norm > 0.7) {
      intentBonus = Math.log1p(bm25Score) * 0.5; // Flat bonus for finding a real record match
    }

    intent.ce_score = ceScore;
    intent.bm25_score = bm25Score;
    intent.final_score = combinedScore + intentBonus;
  });

  //sort intents
  currentIntents.sort((a, b) => b.final_score - a.final_score);
  const intent = currentIntents[0].intent;

  //calculate boots
  let boosts = {
    title: 3,
    author: 2,
    description: 1,
    categories: 2,
    publisher: 1,
    isbn: 1,
    publisher: 1,
    published_year: 1,
  };
  let targetVector = "title_embedding";
  if (intent == "TITLE_SEARCH") {
    boosts.title = 8;
    boosts.author = 4;
    boosts.description = 3;
  } else if (intent == "AUTHOR_SEARCH") {
    boosts.title = 4;
    boosts.author = 8;
  } else if (intent == "PUBLISHER_SEARCH") {
    boosts.title = 4;
    boosts.publisher = 8;
  } else if (intent == "YEAR_SEARCH") {
    boosts.published_year = 8;
  } else if (intent == "GENRE_SEARCH") {
    boosts.categories = 3;
    boosts.description = 2;
  } else if (intent == "DESCRIPTION_SEARCH") {
    boosts.description = 4;
  }

  return {
    cleanQuery: cleanQuery,
    intent: intent,
    boosts,
    targetVector,
  };
};

const parallel_retrieval_for_intent = (cleanQuery) => {
  if (!cleanQuery || cleanQuery.trim() === "") {
    throw new Error("Valid query required");
  }

  const tasks = [
    // title match
    esClient().search({
      index: indexName,
      size: 1,
      query: {
        match: {
          title: {
            query: cleanQuery.trim(),
            fuzziness: "AUTO",
            minimum_should_match: "80%",
          },
        },
      },
    }),
    // author match
    esClient().search({
      index: indexName,
      size: 1,
      query: {
        match: {
          author: {
            query: cleanQuery.trim(),
            fuzziness: "AUTO",
            minimum_should_match: "90%",
          },
        },
      },
    }),
    // publisher match
    esClient().search({
      index: indexName,
      size: 1,
      query: {
        match: {
          publisher: {
            query: cleanQuery.trim(),
            fuzziness: "AUTO",
            minimum_should_match: "80%",
          },
        },
      },
    }),
    // published_year match
    esClient().search({
      index: indexName,
      size: 1,
      query: {
        match: {
          published_year: {
            query: cleanQuery.trim(),
            fuzziness: "AUTO",
            minimum_should_match: "50%",
          },
        },
      },
    }),
    // // isbn match
    // esClient().search({
    //   index: indexName,
    //   size: 1,
    //   query: {
    //     match: {
    //       isbn: {
    //         query: cleanQuery.trim(),
    //         fuzziness: "AUTO",
    //         minimum_should_match: "80%",
    //       },
    //     },
    //   },
    // }),
  ];
  return tasks;
};

const intents = [
  {
    intent: "TITLE_SEARCH",
    bm25_score: 0,
    ce_score: 0,
    final_score: 0,
    // Cues: Specificity, "The", "Of", Proper Nouns
    desc: "The user is providing a specific book title or the exact name of a literary work, like 'The Great Gatsby' or 'Salem Falls'. A search for a specific book title or novel name. Examples: 'Salem Falls', 'The Great Gatsby', 'To Kill a Mockingbird'.",
  },
  {
    intent: "AUTHOR_SEARCH",
    bm25_score: 0,
    ce_score: 0,
    final_score: 0,
    // Cues: Names, "by", "written by", "works of"
    desc: "A search for books written by a specific person or author. Patterns: '[Name] books', 'works by [Name]', 'books written by [Name]'. The user is looking for books written by a specific person, author, or novelist. Often includes 'by [Name]' or just a person's name.",
  },
  {
    intent: "PUBLISHER_SEARCH",
    bm25_score: 0,
    ce_score: 0,
    final_score: 0,
    // Cues: Company names, "published by", "press", "house"
    desc: "A search for a specific publishing house or company. Examples: 'Penguin Books', 'HarperCollins', 'Oxford University Press'. The user is searching for a publishing company, press, or imprint name such as 'Penguin Books', 'Vintage', or 'Scholastic'.",
  },
  {
    intent: "YEAR_SEARCH",
    bm25_score: 0,
    ce_score: 0,
    final_score: 0,
    // Cues: Numbers (4 digits), "released in", "from the 90s"
    desc: "Asearch for books published in a specific year or date. Example: 'books from 1995', 'published in 2023'. The user is providing a specific year, date, or decade to find books published during that time, like '2024' or 'books from 1950'.",
  },
  {
    intent: "ISBN_SEARCH",
    bm25_score: 0,
    ce_score: 0,
    final_score: 0,
    // Cues: Long strings of digits, dashes
    desc: "A search using a unique book identifier code or 13-digit number like '9780345391803'. The user is providing a unique 10-digit or 13-digit ISBN identification number.",
  },
  {
    intent: "GENRE_SEARCH",
    bm25_score: 0,
    ce_score: 0,
    final_score: 0,
    // Cues: Categories, "books about", "type of"
    desc: "A search for a broad category or type of literature. Examples: 'horror books', 'science fiction', 'history category'. The user is searching for a broad category, genre, or subject matter, such as 'Science Fiction', 'True Crime', or 'Romance novels'.",
  },
  {
    intent: "DESCRIPTION_SEARCH",
    bm25_score: 0,
    ce_score: 0,
    final_score: 0,
    // Cues: Narrative, long phrases, "a book where", "plot about"
    desc: "A natural language summary of a story's plot or characters. Example: 'a book about a wizard boy', 'story about a shipwreck'. The user is describing a story's plot, a book they forgot the name of, specific characters, or a summary of what happens in the book.",
  },
];

// Matches exactly 9 digits (each optionally followed by a dash or space)
// followed by a final digit or 'X'
const isbn10Regex = /\b(?:\d[-\s]?){9}[\dXx]\b/;

// Matches 978 or 979 prefix followed by 10 digits (optionally separated)
const isbn13Regex = /\b(?:97[89][-\s]?)(?:\d[-\s]?){10}\b/;

// Combined stricter version
const strictIsbnRegex = new RegExp(
  `${isbn10Regex.source}|${isbn13Regex.source}`,
);

const f = async () => {
  const res = await getSearchIntent("jane austen books");
  console.log(res);
};

// f();

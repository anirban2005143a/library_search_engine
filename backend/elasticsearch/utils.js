import { esClient } from "./elasticsearch.js";
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

export const getSearchIntent = async (queryText) => {
  const intent_response = await axios.post(
    `${process.env.PYTHON_SERVER_URL}/search-intent`,
    {
      query: queryText,
    },
  );

  const clean_query = intent_response.data.clean_query;
  const intent = intent_response.data.intent;

  // 1. Initial Default Weights (Baseline)
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
  let targetVector = "title_embedding"; // Default vector

  if (intent == "AUTHOR_SEARCH") {
    boosts.author = 10;
    boosts.publisher = 2;
    boosts.title = 2;
    boosts.description = 0;
  }
  if (intent == "YEAR_LOOKUP") {
    boosts.published_year = 20;
  }
  if (intent == "ISBN_SEARCH") {
    boosts.isbn = 20;
    boosts.title = 0.1;
    boosts.description = 0.1;
    boosts.author = 0.1;
    boosts.categories = 0.1;
  }
  if (intent == "GENRE_SEARCH") {
    boosts.title = 2;
    boosts.author = 1;
    boosts.description = 5;
    boosts.categories = 12;
    boosts.isbn = 0.1;
    targetVector = "context_embedding";
  }
  if (intent == "TITLE_LOOKUP") {
    boosts.title = 8;
    boosts.categories = 2;
    boosts.description = 0.2;
    targetVector = "title_embedding";
  }
  if (intent == "DESCRIPTION_SEARCH") {
    boosts.description = 8;
    boosts.categories = 1;
    targetVector = "context_embedding";
  }

  return {
    cleanQuery: clean_query,
    intent,
    boosts,
    targetVector,
  };
};

/**
 * Reranks results using dynamic thresholds based on quartiles.
 */
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

      /** * OPTIONAL: Apply Multiplicative Boosting
       * We convert CE logit to a 0-1 probability using sigmoid
       */
      let combinedScore;
      if (intent == "FILTERING")
        combinedScore = ceScore + Math.pow(rrfScore, 0.5);
      combinedScore = ceScore * Math.log1p(1 + rrfScore);

      let intentBonus = 0;
      if (intent === "AUTHOR_SEARCH") {
        intentBonus = Math.log1p(1 + rrfScore) * 0.5;
      } else if (intent === "NAVIGATIONAL_LOOKUP") {
        intentBonus = Math.log1p(1 + rrfScore) * 0.3;
      }

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

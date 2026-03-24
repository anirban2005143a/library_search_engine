import { esClient } from "./elasticsearch.js";
import nlp from 'compromise';


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
  console.log(count)
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
  "cult, cult classic, niche favorite"
];


export const getSearchIntent = (queryText) => {
  const doc = nlp(queryText);
  const words = queryText.trim().split(/\s+/);
  
  // 1. Initial Default Weights (Baseline)
  let boosts = { title: 3, author: 2, description: 1, categories: 2 };
  let targetVector = "context_embedding"; // Default vector
  let intent = "GENERAL_SEARCH";

  // 2. Entity Detection (using NLP grammar, not a list)
  const people = doc.people().text();
  const numbers = doc.numbers().get();
  const hasAuthorPhrase = /by\s+|written\s+by/i.test(queryText);

  // 3. Logic: Author Intent
  if (people || hasAuthorPhrase) {
    intent = "AUTHOR_SEARCH";
    boosts.author = 10;
    boosts.title = 2;
    // If they name a person, they likely want that person's books
  }

  // 4. Logic: Identifier Intent (ISBN or Year)
  if (numbers.length > 0) {
    const numStr = numbers[0].toString();
    if (numStr.length === 4) boosts.published_year = 10; // It's a year
    if (numStr.length >= 10) boosts.isbn = 15;           // It's an ISBN
  }

  // 5. Logic: Short vs Long (Navigation vs Semantic)
  if (words.length <= 3 && intent !== "AUTHOR_SEARCH") {
    // Short queries are usually Titles or Categories
    intent = "NAVIGATIONAL_LOOKUP";
    boosts.title = 8;
    boosts.categories = 5;
    targetVector = "title_embedding"; // Use the Title Vector for short queries
  } 
  else if (words.length > 6) {
    // Long queries are usually plot descriptions
    intent = "DESCRIPTION_SEARCH";
    boosts.description = 8;
    boosts.categories = 1;
    targetVector = "context_embedding"; // Use Context Vector for plot/vibes
  }

  return {
    cleanQuery: queryText.replace(/(by|written by|books about)\s+/gi, "").trim(),
    intent,
    boosts,
    targetVector // Use this to decide which KNN field to query
  };
};
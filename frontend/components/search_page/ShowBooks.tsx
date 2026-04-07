"use client"

import { AnimatePresence, motion } from "framer-motion";
import { XCircle } from "lucide-react";
import React, { memo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store"; // adjust path to your store
import ItemCard from "./ItemCard";
import Loader from "../Loader";

const ShowBooks: React.FC = memo(() => {
  const books = useSelector((state: RootState) => state.catalogue.books );
  // const books = [
  //       {
  //           "_index": "books",
  //           "_id": "f48c5b11-582a-42ae-9095-aa1fdb55f247",
  //           "_score": 0.994646,
  //           "_source": {
  //               "title": "Ashes in the Wind",
  //               "author": "Kathleen E. Woodiwiss",
  //               "publisher": "John Murray Publishers Ltd",
  //               "language": "English",
  //               "published_year": "1983",
  //               "categories": "Romance, Historical Romance, Historical, Historical Fiction, Fiction, Civil War, American Civil War, Adult, War, M F Romance",
  //               "description": "Disguised as a boy, lovely Alaina MacGaren flees the Yankee troops ravaging her Virginia plantation. When the young orphan is accosted by a group of soldiers, Yankee surgeon Cole Latimer rescues the \"lad\"--never guessing that love for the rebel beauty will set duty against desire, ultimately testing his loyalties, his trust and his honor.",
  //               "thumbnail": "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1296262208l/896627.jpg",
  //               "pages": "664.0",
  //               "link": "",
  //               "isbn": "9.78E+12",
  //               "location": "Shelf M7",
  //               "availability_status": "5",
  //               "id": "f48c5b11-582a-42ae-9095-aa1fdb55f247",
  //               "format": "Hardcover",
  //               "type": "Journal",
  //               "reading_level": "Adult",
  //               "average_rating": "3.03"
  //           },
  //           "rrf_ranking_score": 2.8499999999999996,
  //           "ce_score": 0.07415390014648438,
  //           "ce_title_score": 0.006511688232421875,
  //           "ce_context_score": 0.091064453125,
  //           "final_score": 0.3404262732026532,
  //           "norm_ce_score": 0.5037076950073243
  //       },
  //       {
  //           "_index": "books",
  //           "_id": "bbc0553d-7850-46bd-b868-3ccdcee85175",
  //           "_score": 0.828462,
  //           "_source": {
  //               "title": "Fielding's Folly",
  //               "author": "Frances Parkinson Keyes",
  //               "publisher": "Avon Books",
  //               "language": "English",
  //               "published_year": "1940",
  //               "categories": "historical_fiction",
  //               "description": "Eunice Hale & Francis Fielding fell instantly, and madly, in love. Their whirlwind courtship led to a marriage and girl could only imagine and the honeymoon was a dream come true. Sadly, marital problems entered their idealistic marriage, as Eunice was paying the bills, which prideful southerner Francis could not tolerate.  To add insult to injury, a first class temptress, Edith, stepped into the picture, making the Fielding marriage toss on even more rocky waters. What Eunice didn't previously know was that Edith was not the first woman to reel Francis in...nor would she be the last...    ''Brilliant Novel of a Tempestuous Marriage''--fr.cvr  ''A girl from Vermont and a boy from Virginia have an impetuous courtship and marriage leading to a strange tense life together.''--Aurora   Read more Read less",
  //               "thumbnail": "",
  //               "pages": "",
  //               "link": "",
  //               "isbn": "978-1-113-49231-9",
  //               "location": "Shelf R7",
  //               "availability_status": "2",
  //               "id": "bbc0553d-7850-46bd-b868-3ccdcee85175",
  //               "format": "eBook",
  //               "type": "Newspaper",
  //               "reading_level": "Adult",
  //               "average_rating": "3.71"
  //           },
  //           "rrf_ranking_score": 0.95,
  //           "ce_score": 0.06676177978515625,
  //           "ce_title_score": 0.00714874267578125,
  //           "ce_context_score": 0.0816650390625,
  //           "final_score": 0.28498009568358496,
  //           "norm_ce_score": 0.5033380889892578
  //       }
  //   ]
  const isLoading = useSelector((state:RootState) =>state.catalogue.isLoading)

  if(isLoading){
    return (<div className=" w-full flex justify-center">
      <Loader text="Loading Books ..."/>
    </div>)
  }

  console.log(books)

  return (
    <>
      <section className="flex-1 space-y-6 min-w-0">
        {/* Results Grid */}
        <AnimatePresence mode="wait">
          {books.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg border border-border bg-card p-12 text-center"
            >
              <XCircle
                size={48}
                className="mx-auto mb-4 text-muted-foreground/50"
              />
              <h3 className="text-base font-semibold text-foreground mb-1">
                No results found
              </h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
              {/* {(query || activeFiltersCount > 0) && (
                <button
                  onClick={clearAll}
                  className="mt-4 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Clear all filters
                </button>
              )} */}
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <AnimatePresence mode="popLayout">
                {books.map((book:any, index:number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{
                      duration: 0.2,
                      delay: Math.min(index * 0.03, 0.2),
                    }}
                  >
                    <ItemCard book={book} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
}
)
export default ShowBooks;
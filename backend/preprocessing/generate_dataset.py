import pandas as pd
import random
import os
from concurrent.futures import ProcessPoolExecutor
import multiprocessing

# Load your data
df = pd.read_csv('library_catalog_updated.csv')

t_templates = [
    "{title}",
    "find {title}",
    "do you have {title}?",
    "i need the book {title}",
    "get me {title} by {author}",
    "{title} written by {author}",
    "is {title} in the library?",
    "look up {title}",

    # New diverse ones
    "can you check if {title} is available?",
    "i’m looking for {title}",
    "have you got a copy of {title}?",
    "where can i find {title}?",
    "is {title} by {author} available?",
    "please search for {title}",
    "any idea if {title} is in stock?",
    "can i borrow {title}?",
    "i want {title} from {published_year}",
    "show me details for {title} by {author}",
    "is there a {categories} book called {title}?",
    "find {title} in {categories}",
    "i forgot the author but the book is {title}",
    "{title} please",
    "check availability for {title} by {author}"
]

a_templates = [
    "{author}",
    "books by {author}",
    "who is {author}?",
    "show me work of {author}",
    "i want to read something from {author}",
    "list books by {author}",
    "{author}'s {categories} books",

    # New
    "what books has {author} written?",
    "can you suggest books by {author}?",
    "i like {author}, what should i read?",
    "is there any {categories} book by {author}?",
    "give me popular books from {author}",
    "show all titles from {author}",
    "any books by {author} from {published_year}?",
    "recommend something written by {author}",
    "what genre does {author} write?",
    "find {categories} books by {author}",
    "top rated books of {author}",
    "i’ve read one book by {author}, suggest more",
    "books written by {author} in {published_year}",
    "does {author} have any {categories} books?"
]

g_templates = [
    "{categories}",
    "i like {categories} books",
    "recommend some {categories}",
    "any {categories} available?",
    "search for {categories} genre",
    "best {categories} books from {published_year}",

    # New
    "i’m in the mood for {categories}",
    "show me good {categories} books",
    "any popular {categories} books?",
    "suggest top {categories} novels",
    "what are the best {categories} reads?",
    "find me something in {categories}",
    "recommend {categories} books from {published_year}",
    "do you have recent {categories} books?",
    "list some famous {categories} titles",
    "i enjoy {categories}, any suggestions?",
    "new releases in {categories}",
    "classic {categories} books",
    "give me {categories} books by {author}",
    "{categories} books under {published_year}",
    "what should i read in {categories} genre?"
]

y_templates = [
    "books from {published_year}",
    "{published_year} releases",
    "what was published in {published_year}?",
    "show me {published_year} books",

    # New
    "any books published in {published_year}?",
    "list books from the year {published_year}",
    "what are some popular books from {published_year}?",
    "find books released in {published_year}",
    "give me titles from {published_year}",
    "what came out in {published_year}?",
    "top books of {published_year}",
    "books between {published_year} and {published_year}",
    "recent books from {published_year}",
    "any {categories} books from {published_year}?",
    "books by {author} in {published_year}"
]

i_templates = [
    "{isbn}",
    "isbn {isbn}",
    "search isbn {isbn}",
    "find book code {isbn}",

    # New
    "can you find this isbn {isbn}?",
    "look up book with isbn {isbn}",
    "details for isbn {isbn}",
    "which book has isbn {isbn}?",
    "search for book number {isbn}",
    "track book with isbn {isbn}",
    "is isbn {isbn} available?",
    "get book info for {isbn}",
    "who wrote the book with isbn {isbn}?",
    "find title using isbn {isbn}"
]

p_templates = [
    "{publisher}",
    "books by {publisher}",
    "show books from {publisher}",
    "find titles published by {publisher}",

    # Natural variations
    "what books does {publisher} publish?",
    "any books from {publisher}?",
    "list books by publisher {publisher}",
    "show me publications from {publisher}",
    "i want books published by {publisher}",
    "give me books from {publisher}",
    "does {publisher} have any good books?",
    "popular books from {publisher}",
    "recent books by {publisher}",

    # Conversational
    "i like books from {publisher}",
    "can you suggest books by {publisher}?",
    "what are some famous {publisher} books?",
    "anything interesting from {publisher}?",

    # Multi-field combos
    "{categories} books by {publisher}",
    "books by {publisher} in {published_year}",
    "find {categories} books from {publisher}",
    "books published by {publisher} written by {author}",
    "{publisher} books about {categories}",
    "top books from {publisher} in {published_year}",

    # Short / imperfect
    "{publisher} books",
    "publisher {publisher}",
    "books {publisher}",
    "{publisher} titles pls"
]

d_templates = [
    # Simple queries
    "books about {desc}",
    "i'm looking for a story involving {desc}",
    "find something like {desc}",
    "search description: {desc}",
    "recommend me books featuring {desc}",
    "any books with {desc}?",

    # Humanistic / conversational
    "can you suggest books about {desc}?",
    "looking for a story that includes {desc}",
    "show me novels related to {desc}",
    "i want a book with {desc}",
    "books that feature {desc}",

    # Multi-field combinations
    "books about {desc} in {categories} genre",
    "any {categories} books involving {desc}?",
    "i want a {categories} story about {desc}",
    "{desc} by {author}", 
    "{desc} from {publisher}",
    "show me {published_year} books that include {desc}",

    # Mixed / human-style shorter queries
    "{desc}?",
    "story with {desc}",
    "novel including {desc}",
    "fiction about {desc}",
    "tale featuring {desc}"
]

import random

def get_desc_snippets(description, n=6):
    words = str(description).split()
    snippets = []

    if len(words) < 5:
        return [description]

    for _ in range(n):
        strategy = random.choice([
            "start", "middle", "end",
            "random_chunk", "keywords",
            "mixed", "short", "compressed"
        ])

        # 1. Start
        if strategy == "start":
            k = random.randint(4, min(12, len(words)))
            snippets.append(" ".join(words[:k]))

        # 2. Middle
        elif strategy == "middle":
            start = random.randint(1, max(1, len(words)//2))
            k = random.randint(4, 10)
            snippets.append(" ".join(words[start:start+k]))

        # 3. End
        elif strategy == "end":
            k = random.randint(4, min(10, len(words)))
            snippets.append(" ".join(words[-k:]))

        # 4. Random chunk
        elif strategy == "random_chunk":
            start = random.randint(0, len(words)-4)
            k = random.randint(4, 10)
            snippets.append(" ".join(words[start:start+k]))

        # 5. Keywords (longer words)
        elif strategy == "keywords":
            keywords = [w for w in words if len(w) > 4]
            if len(keywords) >= 3:
                snippets.append(" ".join(random.sample(keywords, min(6, len(keywords)))))
            else:
                snippets.append(" ".join(words[:6]))

        # 6. Mixed shuffle
        elif strategy == "mixed":
            sample = random.sample(words, min(len(words), random.randint(5, 10)))
            snippets.append(" ".join(sample))

        # 7. Short phrase (very human)
        elif strategy == "short":
            k = random.randint(3, 6)
            snippets.append(" ".join(words[:k]))

        # 8. Compressed (start + end)
        elif strategy == "compressed":
            snippets.append(" ".join(words[:3] + words[-3:]))

    return snippets

df['description'] = (
    df['description']
    .str.lower()
    .str.replace(r'[^a-z0-9\s]', '', regex=True)
    .str.strip()
)

# 🔹 Worker must be top-level (IMPORTANT for multiprocessing)
def process_row(row_dict, num_queries_per_field):
    row_data = []

    # TITLE_SEARCH
    for _ in range(num_queries_per_field):
        row_data.append({
            'text': random.choice(t_templates).format(
                title=row_dict['title'], 
                author=row_dict['author'], 
                categories=row_dict['categories'],
                published_year=row_dict['published_year']),
            'label': 'TITLE_SEARCH'
        })

    # AUTHOR_SEARCH
    for _ in range(num_queries_per_field):
        row_data.append({
            'text': random.choice(a_templates).format(
                title=row_dict['title'], 
                author=row_dict['author'], 
                categories=row_dict['categories'],
                published_year=row_dict['published_year']),
            'label': 'AUTHOR_SEARCH'
        })

    # GENRE_SEARCH
    for _ in range(num_queries_per_field):
        row_data.append({
            'text': random.choice(g_templates).format(
                title=row_dict['title'], 
                author=row_dict['author'], 
                categories=row_dict['categories'], 
                published_year=row_dict['published_year']),
            'label': 'GENRE_SEARCH'
        })

    # YEAR_SEARCH
    for _ in range(num_queries_per_field):
        row_data.append({
            'text': random.choice(y_templates).format(
                title=row_dict['title'], 
                author=row_dict['author'], 
                categories=row_dict['categories'], 
                published_year=row_dict['published_year']),
            'label': 'YEAR_SEARCH'
        })

    # ISBN_SEARCH
    for _ in range(num_queries_per_field):
        row_data.append({
            'text': random.choice(i_templates).format(
                title=row_dict['title'], 
                author=row_dict['author'], 
                categories=row_dict['categories'], 
                published_year=row_dict['published_year'],
                isbn=row_dict['isbn']),
            'label': 'ISBN_SEARCH'
        })

    # DESCRIPTION_SEARCH
    d_snippets = get_desc_snippets(row_dict['description'], n=num_queries_per_field)
    for desc in d_snippets:
        row_data.append({
            'text': random.choice(d_templates).format(
                desc=desc,
                author=row_dict['author'], 
                categories=row_dict['categories'], 
                publisher=row_dict['publisher'],
                published_year=row_dict['published_year']),
            'label': 'DESCRIPTION_SEARCH'
        })

    # PUBLISHER_SEARCH
    for _ in range(num_queries_per_field):
        row_data.append({
            'text': random.choice(p_templates).format(
                title=row_dict['title'], 
                author=row_dict['author'], 
                categories=row_dict['categories'], 
                publisher=row_dict['publisher'],
                published_year=row_dict['published_year']
            ),
            'label': 'PUBLISHER_SEARCH'
        })

    return row_data


def generate_smart_data_multiprocessing(
    df,
    output_file="search_intent_data.csv",
    batch_size=10000,
    num_queries_per_field=5,
    num_workers=None
):
    
    if num_workers is None:
        num_workers = multiprocessing.cpu_count()  # use all cores

    if os.path.exists(output_file):
        os.remove(output_file)

    total_rows = len(df)
    total_batches = (total_rows // batch_size) + 1

    print(f"Total rows: {total_rows}")
    print(f"Batch size: {batch_size}")
    print(f"Workers (CPU cores): {num_workers}")
    print("="*50)

    for batch_idx, start in enumerate(range(0, total_rows, batch_size), start=1):
        end = min(start + batch_size, total_rows)
        batch_df = df.iloc[start:end]

        # Convert rows to dict (important for multiprocessing)
        rows = batch_df.to_dict(orient="records")

        # 🔥 Multiprocessing
        with ProcessPoolExecutor(max_workers=num_workers) as executor:
            results = list(executor.map(
                process_row,
                rows,
                [num_queries_per_field] * len(rows)
            ))

        # Flatten
        batch_data = []
        for r in results:
            batch_data.extend(r)

        batch_df_out = pd.DataFrame(batch_data)

        # Save incrementally
        if not os.path.exists(output_file):
            batch_df_out.to_csv(output_file, index=False)
        else:
            batch_df_out.to_csv(output_file, mode='a', header=False, index=False)

        # Logs
        print(f"Batch {batch_idx}/{total_batches} done | Rows: {end}/{total_rows} | Generated: {len(batch_df_out)}")

    print("✅ Data generation completed!")

# generate_smart_data(df=df).head()

if __name__ == "__main__":
    generate_smart_data_multiprocessing(df)


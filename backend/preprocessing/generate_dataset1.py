

import pandas as pd
import random
import re
from typing import List, Dict, Any
import os
from concurrent.futures import ProcessPoolExecutor
import multiprocessing


# Load your data
df = pd.read_csv('library_catalog_updated.csv')

t_train_templates = [
    # Single-field (3 examples)
    "{title}",
    "book {title}",
    "{title} book",
    
    # Two-field (10 examples)
    "{title} {author}",
    "{author} {title}",
    "{title} {published_year}",
    "{title} {categories}",
    "{title} {format}",
    "{title} {language}",
    "{title} {isbn}",
    "{title} {location}",
    "{title} {author}",
    "{title} {published_year}",
    
    # Three-field (7 examples)
    "{title} {author} {published_year}",
    "{title} {author} {categories}",
    "{title} {author} {format}",
    "{title} {author} {language}",
    "{title} {categories} {published_year}",
    "{title} {format} {language}",
    "{title} {author} {location}"
]

t_test_templates = [

    "the book {title}",
    
    # Two-field (4 examples - new combos)
    "{title} {reading_level}",
    "{title} {average_rating}",
    "{title} {availability_status}",
    "{title} {isbn}",
    
    # Three-field (4 examples - complex combos)
    "{title} {author} {reading_level}",
    "{title} {author} {average_rating}",
    "{title} {categories} {reading_level}",
    "{title} {format} {availability_status}",
    
    # Four-field (2 examples - high complexity)
    "{title} {author} {published_year} {format}",
    "{title} {author} {categories} {language}"
]

a_train_templates = [
    # Single-field (3 examples)
    "{author}",
    "books by {author}",
    "{author} books",
    
    # Two-field (10 examples)
    "{author} {title}",
    "{title} {author}",
    "{author} {published_year}",
    "{author} {categories}",
    "{author} {format}",
    "{author} {language}",
    "{author} {isbn}",
    "{author} {location}",
    "{author} books",
    "books by {author}",
    
    # Three-field (7 examples)
    "{author} {title} {published_year}",
    "{author} {title} {categories}",
    "{author} {title} {format}",
    "{author} {title} {language}",
    "{author} {categories} {published_year}",
    "{author} {format} {language}",
    "{author} {title} {location}"
]

a_test_templates = [
    # Single-field (1 unique)
    "works by {author}",
    
    # Two-field (4 examples - new combos)
    "{author} {reading_level}",
    "{author} {average_rating}",
    "{author} {availability_status}",
    "{author} {categories} books",
    
    # Three-field (4 examples - complex combos)
    "{author} {title} {reading_level}",
    "{author} {title} {average_rating}",
    "{author} {categories} {reading_level}",
    "{author} {format} {availability_status}",
    
    # Four-field (1 example - high complexity)
    "{author} {title} {published_year} {format}"
    "{author} {title} {categories} {language}"
]

g_train_templates = [
    # Single-field (3 unique examples)
    "{categories}",
    "{categories} books",
    "books in {categories}",
    
    # Two-field (10 examples)
    "{categories} {title}",
    "{title} {categories}",
    "{categories} {author}",
    "{author} {categories}",
    "{categories} {format}",
    "{categories} {language}",
    "{categories} {published_year}",
    "{categories} {reading_level}",
    "{categories} {title}",
    "{categories} {author}",
    
    # Three-field (7 examples)
    "{categories} {title} {author}",
    "{categories} {title} {format}",
    "{categories} {author} {published_year}",
    "{categories} {title} {language}",
    "{categories} {format} {reading_level}",
    "{categories} {author} {language}",
    "{categories} {title} {published_year}",
    
    # Four-field (0 examples - reserved for test)
]

g_test_templates = [
    # Single-field (1 unique)
    "{categories} section",
    
    # Two-field (3 examples - new combos)
    "{categories} {average_rating}",
    "{categories} {availability_status}",
    "{categories} {location}",
    
    # Three-field (3 examples - complex combos)
    "{categories} {title} {average_rating}",
    "{categories} {author} {availability_status}",
    "{categories} {format} {location}",
    
    # Four-field (3 examples - max complexity)
    "{categories} {title} {author} {format}",
    "{categories} {title} {author} {published_year}",
    "{categories} {author} {format} {reading_level}"
]

y_train_templates = [
    # Single-field (3 unique examples)
    "{published_year}",
    "books from {published_year}",
    "{published_year} books",
    
    # Two-field (10 examples)
    "{published_year} {title}",
    "{title} {published_year}",
    "{published_year} {author}",
    "{author} {published_year}",
    "{published_year} {categories}",
    "{categories} {published_year}",
    "{published_year} {format}",
    "{published_year} {language}",
    "{published_year} {title}",
    "{published_year} {author}",
    
    # Three-field (7 examples)
    "{published_year} {title} {author}",
    "{published_year} {title} {categories}",
    "{published_year} {author} {categories}",
    "{published_year} {title} {format}",
    "{published_year} {author} {language}",
    "{published_year} {categories} {format}",
    "{published_year} {title} {location}",
    
    # Four-field (0 examples - reserved for test)
]

y_test_templates = [
    # Single-field (1 unique)
    "published in {published_year}",
    
    # Two-field (3 examples - new combos)
    "{published_year} {reading_level}",
    "{published_year} {average_rating}",
    "{published_year} {availability_status}",
    
    # Three-field (3 examples - complex combos)
    "{published_year} {title} {reading_level}",
    "{published_year} {author} {average_rating}",
    "{published_year} {categories} {availability_status}",
    
    # Four-field (3 examples - max complexity)
    "{published_year} {title} {author} {format}",
    "{published_year} {title} {author} {language}",
    "{published_year} {author} {categories} {reading_level}"
]

i_train_templates = [
    # Single-field (3 unique examples)
    "{isbn}",
    "isbn {isbn}",
    "book with isbn {isbn}",
    
    # Two-field (10 examples)
    "{isbn} {title}",
    "{title} {isbn}",
    "{isbn} {author}",
    "{author} {isbn}",
    "{isbn} {format}",
    "{isbn} {published_year}",
    "{isbn} {language}",
    "{isbn} {categories}",
    "{isbn} {title}",
    "{isbn} {author}",
    
    # Three-field (7 examples)
    "{isbn} {title} {author}",
    "{isbn} {title} {format}",
    "{isbn} {author} {published_year}",
    "{isbn} {title} {language}",
    "{isbn} {author} {categories}",
    "{isbn} {title} {location}",
    "{isbn} {format} {language}",
    
    # Four-field (0 examples - reserved for test)
]

i_test_templates = [
    # Single-field (1 unique)
    "scan {isbn}",
    
    # Two-field (3 examples - new combos)
    "{isbn} {reading_level}",
    "{isbn} {average_rating}",
    "{isbn} {availability_status}",
    
    # Three-field (3 examples - complex combos)
    "{isbn} {title} {reading_level}",
    "{isbn} {author} {average_rating}",
    "{isbn} {title} {availability_status}",
    
    # Four-field (3 examples - max complexity)
    "{isbn} {title} {author} {format}",
    "{isbn} {title} {author} {published_year}",
    "{isbn} {author} {categories} {language}"
]

p_train_templates = [
    # Single-field (3 unique examples)
    "{publisher}",
    "{publisher} press",
    "books by {publisher}",
    
    # Two-field (10 examples)
    "{publisher} {title}",
    "{title} {publisher}",
    "{publisher} {author}",
    "{author} {publisher}",
    "{publisher} {categories}",
    "{categories} {publisher}",
    "{publisher} {published_year}",
    "{publisher} {format}",
    "{publisher} {title}",
    "{publisher} {author}",
    
    # Three-field (7 examples)
    "{publisher} {title} {author}",
    "{publisher} {title} {published_year}",
    "{publisher} {author} {categories}",
    "{publisher} {title} {format}",
    "{publisher} {author} {language}",
    "{publisher} {categories} {published_year}",
    "{publisher} {title} {location}",
    
    # Four-field (0 examples - reserved for test)
]

p_test_templates = [
    # Single-field (1 unique)
    "published by {publisher}",
    
    # Two-field (3 examples - new combos)
    "{publisher} {reading_level}",
    "{publisher} {average_rating}",
    "{publisher} {availability_status}",
    
    # Three-field (3 examples - complex combos)
    "{publisher} {title} {reading_level}",
    "{publisher} {author} {average_rating}",
    "{publisher} {categories} {availability_status}",
    
    # Four-field (3 examples - max complexity)
    "{publisher} {title} {author} {format}",
    "{publisher} {title} {author} {published_year}",
    "{publisher} {author} {categories} {language}"
]

formate_train_templates = [
    # Single-field (3 unique examples)
    "{format}",
    "{format} books",
    "books in {format}",
    
    # Two-field (10 examples)
    "{format} {title}",
    "{title} {format}",
    "{format} {author}",
    "{author} {format}",
    "{format} {categories}",
    "{categories} {format}",
    "{format} {published_year}",
    "{format} {language}",
    "{format} {title}",
    "{format} {author}",
    
    # Three-field (7 examples)
    "{format} {title} {author}",
    "{format} {title} {published_year}",
    "{format} {author} {categories}",
    "{format} {title} {language}",
    "{format} {author} {published_year}",
    "{format} {categories} {language}",
    "{format} {title} {location}",
    
    # Four-field (0 examples - reserved for test)
]

formate_test_templates = [
    # Single-field (1 unique)
    "{format} edition",
    
    # Two-field (3 examples - new combos)
    "{format} {reading_level}",
    "{format} {average_rating}",
    "{format} {availability_status}",
    
    # Three-field (3 examples - complex combos)
    "{format} {title} {reading_level}",
    "{format} {author} {average_rating}",
    "{format} {categories} {availability_status}",
    
    # Four-field (3 examples - max complexity)
    "{format} {title} {author} {published_year}",
    "{format} {title} {author} {language}",
    "{format} {author} {categories} {reading_level}"
]

type_train_templates = [
    # Single-field (3 unique examples)
    "{type}",
    "{type}s",
    "find {type}",
    
    # Two-field (10 examples)
    "{type} {title}",
    "{title} {type}",
    "{type} {author}",
    "{author} {type}",
    "{type} {categories}",
    "{categories} {type}",
    "{type} {published_year}",
    "{type} {language}",
    "{type} {format}",
    "{type} {title}",
    
    # Three-field (7 examples)
    "{type} {title} {author}",
    "{type} {title} {published_year}",
    "{type} {author} {categories}",
    "{type} {title} {language}",
    "{type} {author} {format}",
    "{type} {categories} {published_year}",
    "{type} {title} {location}",
    
    # Four-field (0 examples - reserved for test)
]

type_test_templates = [
    # Single-field (1 unique)
    "{type} articles",
    
    # Two-field (3 examples - new combos)
    "{type} {reading_level}",
    "{type} {average_rating}",
    "{type} {availability_status}",
    
    # Three-field (3 examples - complex combos)
    "{type} {title} {reading_level}",
    "{type} {author} {average_rating}",
    "{type} {categories} {availability_status}",
    
    # Four-field (3 examples - max complexity)
    "{type} {title} {author} {format}",
    "{type} {title} {author} {published_year}",
    "{type} {author} {categories} {reading_level}"
]

level_train_templates = [
    # Single-field (3 unique examples)
    "{reading_level}",
    "{reading_level} books",
    "books for {reading_level}",
    
    # Two-field (10 examples)
    "{reading_level} {title}",
    "{title} {reading_level}",
    "{reading_level} {author}",
    "{author} {reading_level}",
    "{reading_level} {categories}",
    "{categories} {reading_level}",
    "{reading_level} {format}",
    "{reading_level} {language}",
    "{reading_level} {title}",
    "{reading_level} {author}",
    
    # Three-field (7 examples)
    "{reading_level} {title} {author}",
    "{reading_level} {title} {categories}",
    "{reading_level} {author} {categories}",
    "{reading_level} {title} {format}",
    "{reading_level} {author} {format}",
    "{reading_level} {categories} {published_year}",
    "{reading_level} {title} {location}",
    
    # Four-field (0 examples - reserved for test)
]

level_test_templates = [
    # Single-field (1 unique)
    "{reading_level} section",
    
    # Two-field (3 examples - new combos)
    "{reading_level} {average_rating}",
    "{reading_level} {availability_status}",
    "{reading_level} {publisher}",
    
    # Three-field (3 examples - complex combos)
    "{reading_level} {title} {average_rating}",
    "{reading_level} {author} {availability_status}",
    "{reading_level} {categories} {publisher}",
    
    # Four-field (3 examples - max complexity)
    "{reading_level} {title} {author} {format}",
    "{reading_level} {title} {author} {published_year}",
    "{reading_level} {author} {categories} {language}"
]

d_train_templates = [
    # Single desc only (1 field)
    "{desc1}",
    "books about {desc1}",
    "stories like {desc1}",
    
    # Two desc + other fields (2-3 fields total)
    "{desc1} {desc2}",
    "{desc1} and {desc2}",
    "{desc1} {desc2} by {author}",
    "{desc1} {desc2} in {categories}",
    "{desc1} about {desc2}",
    "books about {desc1} and {desc2}",
    "{desc1} {desc2} {published_year}",
    
    # Three desc + other fields (3-4 fields total)
    "{desc1} {desc2} {desc3}",
    "{desc1}, {desc2}, and {desc3}",
    "{desc1} {desc2} {desc3} by {author}",
    "{desc1} {desc2} {desc3} in {categories}",
    "{desc1} {desc2} and {desc3} {format}",
    "{desc1} related to {desc2} and {desc3}",
    "stories about {desc1}, {desc2}, and {desc3}",
    
    # Four desc + other fields (4-5 fields total)
    "{desc1} {desc2} {desc3} {desc4}",
    "{desc1}, {desc2}, {desc3}, and {desc4}",
    "{desc1} {desc2} {desc3} {desc4} by {author}",
    "{desc1} {desc2} {desc3} and {desc4} in {categories}",
    "books about {desc1}, {desc2}, {desc3}, and {desc4} {format}"
]

d_test_templates = [
    # Single desc with new phrase
    "find me {desc1}",
    
    # Two desc + new fields
    "{desc1} {desc2} {reading_level}",
    "{desc1} and {desc2} {average_rating} stars",
    "{desc1} {desc2} {availability_status}",
    
    # Three desc + new fields
    "{desc1} {desc2} {desc3} by {author} {reading_level}",
    "{desc1}, {desc2}, and {desc3} in {categories} {average_rating}",
    "{desc1} {desc2} {desc3} {format} {availability_status}",
    
    # Four desc + new fields (max complexity)
    "{desc1} {desc2} {desc3} {desc4} by {author} {published_year} {reading_level}",
    "{desc1}, {desc2}, {desc3}, and {desc4} in {categories} {format} {average_rating}",
    "{desc1} {desc2} {desc3} {desc4} {language} {availability_status}"
]



def clean_description(description: str) -> str:
    """Clean and normalize description text"""
    if pd.isna(description) or description == "This edition doesn't have a description yet. Can you add one?":
        return ""
    
    # Convert to string and lowercase
    text = str(description).lower()
    
    # Use re.sub for regex replacement instead of .replace()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    
    return text.strip()

def extract_keywords(words: List[str], min_len: int = 4, max_keywords: int = 12) -> List[str]:
    """Extract meaningful keywords"""
    stopwords = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'were', 'are', 'been', 
                 'have', 'has', 'had', 'this', 'that', 'these', 'those', 'it', 'its'}
    
    keywords = [w for w in words if len(w) >= min_len and w.lower() not in stopwords]
    
    if not keywords:
        keywords = sorted(words, key=len, reverse=True)[:max_keywords]
    
    return keywords[:max_keywords]

def get_desc_snippets_with_fields(description: str, n: int = 12) -> List[Dict[str, Any]]:
    """
    Generate description snippets with field counts
    Returns list of dicts with 'snippets' (list of concept strings) and 'fields_used'
    """
    # Add this line at the start
    description = clean_description(description)


    if not description or "doesn't have a description yet" in description:
        return []
    
    words = description.split()
    
    if len(words) < 5:
        return [{'snippets': [description], 'fields_used': 1}]
    
    # Extract keywords
    keywords = extract_keywords(words, min_len=4, max_keywords=10)
    
    all_snippets = []
    
    # Generate 1-concept snippets
    for _ in range(max(2, n//4)):
        k = random.randint(3, 7)
        start = random.choice([0, random.randint(0, len(words)//3)])
        snippet = " ".join(words[start:start+k])
        all_snippets.append({'snippets': [snippet], 'fields_used': 1})
    
    # Generate 2-concept snippets
    for _ in range(max(3, n//3)):
        if len(keywords) >= 2:
            selected = random.sample(keywords, 2)
            snippets = [selected[0], selected[1]]
        else:
            start = random.randint(0, len(words)-4)
            snippets = [words[start], words[start+1]]
        all_snippets.append({'snippets': snippets, 'fields_used': 2})
    
    # Generate 3-concept snippets
    for _ in range(max(3, n//3)):
        if len(keywords) >= 3:
            selected = random.sample(keywords, 3)
            snippets = [selected[0], selected[1], selected[2]]
        else:
            start = random.randint(0, len(words)-5)
            snippets = [words[start], words[start+1], words[start+2]]
        all_snippets.append({'snippets': snippets, 'fields_used': 3})
    
    # Generate 4-concept snippets
    for _ in range(max(2, n//4)):
        if len(keywords) >= 4:
            selected = random.sample(keywords, 4)
            snippets = [selected[0], selected[1], selected[2], selected[3]]
        else:
            indices = sorted(random.sample(range(len(words)), min(4, len(words))))
            snippets = [words[i] for i in indices]
        all_snippets.append({'snippets': snippets, 'fields_used': 4})
    
    random.shuffle(all_snippets)
    return all_snippets[:n]

def generate_description_queries(row_dict: Dict, templates_train: List[str], templates_test: List[str], 
                                  num_queries_per_field: int = 10, is_train: bool = True) -> List[Dict]:
    """
    Generate description-based queries with multiple desc snippets + other fields
    """
    queries = []

    # Clean description before passing
    cleaned_description = clean_description(row_dict.get('description', ''))
    
    # Get description snippets with field counts
    snippet_data_list = get_desc_snippets_with_fields(
        cleaned_description, 
        n=num_queries_per_field
    )
    
    # Select templates based on train/test
    templates = templates_train if is_train else templates_test
    
    for snippet_data in snippet_data_list:
        snippets = snippet_data['snippets']
        num_desc_fields = snippet_data['fields_used']
        
        # Prepare format arguments
        format_args = {
            'desc1': snippets[0] if len(snippets) >= 1 else '',
            'desc2': snippets[1] if len(snippets) >= 2 else '',
            'desc3': snippets[2] if len(snippets) >= 3 else '',
            'desc4': snippets[3] if len(snippets) >= 4 else '',
            'author': row_dict.get('author', ''),
            'categories': row_dict.get('categories', ''),
            'publisher': row_dict.get('publisher', ''),
            'published_year': row_dict.get('published_year', ''),
            'format': row_dict.get('format', ''),
            'language': row_dict.get('language', ''),
            'reading_level': row_dict.get('reading_level', ''),
            'average_rating': row_dict.get('average_rating', ''),
            'availability_status': row_dict.get('availability_status', ''),
            'isbn': row_dict.get('isbn', ''),
            'location': row_dict.get('location', ''),
            'type': row_dict.get('type', '')
        }
        
        # Filter templates based on desc field count
        # Template should have exactly {desc1}...{descn} matching the snippet count
        candidate_templates = []
        for template in templates:
            # Count how many desc fields the template expects
            desc_fields_in_template = sum(1 for i in range(1, 5) if f'{{desc{i}}}' in template)
            
            # Template should expect same number of desc fields as we have
            if desc_fields_in_template == num_desc_fields:
                candidate_templates.append(template)
        
        # If no exact match, try templates with fewer desc fields (fill with first)
        if not candidate_templates:
            for template in templates:
                desc_fields_in_template = sum(1 for i in range(1, 5) if f'{{desc{i}}}' in template)
                if desc_fields_in_template <= num_desc_fields:
                    # Fill missing desc fields with first snippet
                    temp_args = format_args.copy()
                    for i in range(desc_fields_in_template + 1, 5):
                        temp_args[f'desc{i}'] = snippets[0]
                    candidate_templates.append(template)
        
        if not candidate_templates:
            continue
        
        template = random.choice(candidate_templates)
        
        # Get all fields required by template
        template_fields = re.findall(r'\{(\w+)\}', template)
        
        # Filter args to only fields in template that have values
        filtered_args = {}
        for field in template_fields:
            if field in format_args and format_args[field]:
                filtered_args[field] = format_args[field]
            elif field.startswith('desc') and field not in filtered_args:
                # This shouldn't happen but just in case
                filtered_args[field] = ''
        
        try:
            query = template.format(**filtered_args)
            if query.strip():
                queries.append({
                    'text': query,
                    'label': 'DESCRIPTION_SEARCH',
                    'desc_snippets': snippets,
                    'num_desc_fields': num_desc_fields,
                    'template': template,
                    'other_fields': [f for f in template_fields if not f.startswith('desc')]
                })
        except (KeyError, IndexError) as e:
            # Skip if formatting fails
            continue
    
    return queries


# 🔹 Worker must be top-level (IMPORTANT for multiprocessing)
def process_row(row_dict, num_queries_per_field, is_train=True):
    """
    Process a single row to generate queries for all search types
    
    Args:
        row_dict: Dictionary containing book metadata
        num_queries_per_field: Number of queries to generate per search type
        is_train: If True, use train templates; if False, use test templates
    
    Returns:
        List of dicts with 'text' and 'label'
    """
    row_data = []
    
    # Select templates based on train/test
    t_templates = t_train_templates if is_train else t_test_templates
    a_templates = a_train_templates if is_train else a_test_templates
    g_templates = g_train_templates if is_train else g_test_templates
    y_templates = y_train_templates if is_train else y_test_templates
    i_templates = i_train_templates if is_train else i_test_templates
    d_templates = d_train_templates if is_train else d_test_templates
    p_templates = p_train_templates if is_train else p_test_templates
    f_templates = formate_train_templates if is_train else formate_test_templates
    type_templates = type_train_templates if is_train else type_test_templates
    r_templates = level_train_templates if is_train else level_test_templates
    
    # ========================================================================
    # TITLE_SEARCH
    # ========================================================================
    for _ in range(num_queries_per_field):
        template = random.choice(t_templates)
        
        # Prepare format arguments based on template fields
        template_fields = re.findall(r'\{(\w+)\}', template)
        format_args = {}
        
        for field in template_fields:
            if field in row_dict:
                format_args[field] = row_dict[field]
        
        try:
            query = template.format(**format_args)
            row_data.append({
                'text': query,
                'label': 'TITLE_SEARCH'
            })
        except KeyError:
            continue
    
    
    # ========================================================================
    # AUTHOR_SEARCH
    # ========================================================================
    for _ in range(num_queries_per_field):
        template = random.choice(a_templates)
        
        template_fields = re.findall(r'\{(\w+)\}', template)
        format_args = {}
        
        for field in template_fields:
            if field in row_dict:
                format_args[field] = row_dict[field]
        
        try:
            query = template.format(**format_args)
            row_data.append({
                'text': query,
                'label': 'AUTHOR_SEARCH'
            })
        except KeyError:
            continue
    

    # ========================================================================
    # CATEGORIES_SEARCH (GENRE)
    # ========================================================================
    for _ in range(num_queries_per_field):
        template = random.choice(g_templates)
        
        template_fields = re.findall(r'\{(\w+)\}', template)
        format_args = {}
        
        for field in template_fields:
            if field in row_dict:
                format_args[field] = row_dict[field]
        
        try:
            query = template.format(**format_args)
            row_data.append({
                'text': query,
                'label': 'CATEGORIES_SEARCH'
            })
        except KeyError:
            continue
    

    # ========================================================================
    # YEAR_SEARCH
    # ========================================================================
    for _ in range(num_queries_per_field):
        template = random.choice(y_templates)
        
        template_fields = re.findall(r'\{(\w+)\}', template)
        format_args = {}
        
        for field in template_fields:
            if field in row_dict:
                format_args[field] = row_dict[field]
        
        try:
            query = template.format(**format_args)
            row_data.append({
                'text': query,
                'label': 'YEAR_SEARCH'
            })
        except KeyError:
            continue
    

    # ========================================================================
    # ISBN_SEARCH
    # ========================================================================
    for _ in range(num_queries_per_field):
        template = random.choice(i_templates)
        
        template_fields = re.findall(r'\{(\w+)\}', template)
        format_args = {}
        
        for field in template_fields:
            if field in row_dict:
                format_args[field] = row_dict[field]
        
        try:
            query = template.format(**format_args)
            row_data.append({
                'text': query,
                'label': 'ISBN_SEARCH'
            })
        except KeyError:
            continue
    

    # ========================================================================
    # DESCRIPTION_SEARCH (with multiple desc snippets)
    # ========================================================================
    desc_queries = generate_description_queries(
        row_dict=row_dict,
        templates_train=d_train_templates,
        templates_test=d_test_templates,
        num_queries_per_field=num_queries_per_field,
        is_train=is_train
    )
    
    for query_data in desc_queries:
        row_data.append({
            'text': query_data['text'],
            'label': query_data['label']
        })
    

    # ========================================================================
    # PUBLISHER_SEARCH
    # ========================================================================
    for _ in range(num_queries_per_field):
        template = random.choice(p_templates)
        
        template_fields = re.findall(r'\{(\w+)\}', template)
        format_args = {}
        
        for field in template_fields:
            if field in row_dict:
                format_args[field] = row_dict[field]
        
        try:
            query = template.format(**format_args)
            row_data.append({
                'text': query,
                'label': 'PUBLISHER_SEARCH'
            })
        except KeyError:
            continue
    

    # ========================================================================
    # FORMAT_SEARCH
    # ========================================================================
    for _ in range(num_queries_per_field):
        template = random.choice(f_templates)
        
        template_fields = re.findall(r'\{(\w+)\}', template)
        format_args = {}
        
        for field in template_fields:
            if field in row_dict:
                format_args[field] = row_dict[field]
        
        try:
            query = template.format(**format_args)
            row_data.append({
                'text': query,
                'label': 'FORMAT_SEARCH'
            })
        except KeyError:
            continue
    
    
    # ========================================================================
    # BOOk_TYPE_SEARCH
    # ========================================================================
    for _ in range(num_queries_per_field):
        template = random.choice(type_templates)
        
        template_fields = re.findall(r'\{(\w+)\}', template)
        format_args = {}
        
        for field in template_fields:
            if field in row_dict:
                format_args[field] = row_dict[field]
        
        try:
            query = template.format(**format_args)
            row_data.append({
                'text': query,
                'label': 'FORMAT_SEARCH'
            })
        except KeyError:
            continue
    

    # ========================================================================
    # READING_LEVEL_SEARCH
    # ========================================================================
    for _ in range(num_queries_per_field):
        template = random.choice(r_templates)
        
        template_fields = re.findall(r'\{(\w+)\}', template)
        format_args = {}
        
        for field in template_fields:
            if field in row_dict:
                format_args[field] = row_dict[field]
        
        try:
            query = template.format(**format_args)
            row_data.append({
                'text': query,
                'label': 'READING_LEVEL_SEARCH'
            })
        except KeyError:
            continue
    
    return row_data

def generate_smart_data_multiprocessing(
    df,
    train_output_file="train_search_intent_data.csv",
    test_output_file="test_search_intent_data.csv",
    batch_size=10000,
    num_queries_per_field_train=5,
    num_queries_per_field_test=3,
    num_workers=None
):
    """
    Generate train and test datasets using multiprocessing
    
    Args:
        df: DataFrame with book metadata
        train_output_file: Output file for train data
        test_output_file: Output file for test data
        batch_size: Number of rows per batch
        num_queries_per_field_train: Number of queries per field for train
        num_queries_per_field_test: Number of queries per field for test
        num_workers: Number of parallel workers
    """
    
    if num_workers is None:
        num_workers = multiprocessing.cpu_count()

    # Remove existing files if they exist
    for output_file in [train_output_file, test_output_file]:
        if os.path.exists(output_file):
            os.remove(output_file)

    total_rows = len(df)
    total_batches = (total_rows // batch_size) + 1

    print(f"Total rows: {total_rows}")
    print(f"Batch size: {batch_size}")
    print(f"Workers (CPU cores): {num_workers}")
    print(f"Train queries per field: {num_queries_per_field_train}")
    print(f"Test queries per field: {num_queries_per_field_test}")
    print("="*50)

    for batch_idx, start in enumerate(range(0, total_rows, batch_size), start=1):
        end = min(start + batch_size, total_rows)
        batch_df = df.iloc[start:end]

        # Convert rows to dict
        rows = batch_df.to_dict(orient="records")

        # ============================================================
        # GENERATE TRAIN DATA
        # ============================================================
        print(f"\n📚 Batch {batch_idx}/{total_batches} - Generating TRAIN data...")
        
        with ProcessPoolExecutor(max_workers=num_workers) as executor:
            train_results = list(executor.map(
                process_row,
                rows,
                [num_queries_per_field_train] * len(rows),
                [True] * len(rows)  # is_train=True
            ))

        # Flatten train results
        train_batch_data = []
        for r in train_results:
            train_batch_data.extend(r)

        train_batch_df = pd.DataFrame(train_batch_data)

        # Save train incrementally
        if not os.path.exists(train_output_file):
            train_batch_df.to_csv(train_output_file, index=False)
        else:
            train_batch_df.to_csv(train_output_file, mode='a', header=False, index=False)

        # ============================================================
        # GENERATE TEST DATA
        # ============================================================
        print(f"🧪 Batch {batch_idx}/{total_batches} - Generating TEST data...")
        
        with ProcessPoolExecutor(max_workers=num_workers) as executor:
            test_results = list(executor.map(
                process_row,
                rows,
                [num_queries_per_field_test] * len(rows),
                [False] * len(rows)  # is_train=False
            ))

        # Flatten test results
        test_batch_data = []
        for r in test_results:
            test_batch_data.extend(r)

        test_batch_df = pd.DataFrame(test_batch_data)

        # Save test incrementally
        if not os.path.exists(test_output_file):
            test_batch_df.to_csv(test_output_file, index=False)
        else:
            test_batch_df.to_csv(test_output_file, mode='a', header=False, index=False)

        # Logs
        print(f"✅ Batch {batch_idx}/{total_batches} completed!")
        print(f"   Train: {len(train_batch_df)} queries generated")
        print(f"   Test: {len(test_batch_df)} queries generated")
        print(f"   Progress: {end}/{total_rows} rows processed")
        print("-"*50)

    # Final summary
    print("\n" + "="*50)
    print("✅ DATA GENERATION COMPLETED!")
    print(f"📊 Train data saved to: {train_output_file}")
    print(f"📊 Test data saved to: {test_output_file}")
    
    # Load and show distribution
    train_df = pd.read_csv(train_output_file)
    test_df = pd.read_csv(test_output_file)
    
    print(f"\n📈 Train dataset size: {len(train_df)}")
    print(f"📈 Test dataset size: {len(test_df)}")
    print(f"\n📊 Train label distribution:\n{train_df['label'].value_counts()}")
    print(f"\n📊 Test label distribution:\n{test_df['label'].value_counts()}")

if __name__ == "__main__":
    generate_smart_data_multiprocessing(df)

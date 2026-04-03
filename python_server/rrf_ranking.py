from typing import Dict ,List
from ranx import Run, fuse
from model_type import FusionRequest

def calculate_rrf_score(request:FusionRequest) -> Dict:
    
    query_id = "q1"

    # Convert ES hits → ranx format
    bm25_dict = hits_to_run_dict(request.bm25_dict)
    knn_title_dict = hits_to_run_dict(request.knn_title_dict)
    knn_context_dict = hits_to_run_dict(request.knn_context_dict)
    knn_title_seed = hits_to_run_dict(request.knn_title_seed)
    knn_context_seed = hits_to_run_dict(request.knn_context_seed)

    intent = request.intent

    runs = []
    weights = []

    if intent == "SEED_VECTOR":
        add_run_if_not_empty(runs, weights, bm25_dict, 0.7, query_id)
        add_run_if_not_empty(runs, weights, knn_title_dict, 1.0, query_id)
        add_run_if_not_empty(runs, weights, knn_context_dict, 1.0, query_id)

    else:
        add_run_if_not_empty(runs, weights, bm25_dict, 0.5, query_id)
        add_run_if_not_empty(runs, weights, knn_title_dict, 0.7, query_id)
        add_run_if_not_empty(runs, weights, knn_context_dict, 0.8, query_id)
        add_run_if_not_empty(runs, weights, knn_title_seed, 0.7, query_id)
        add_run_if_not_empty(runs, weights, knn_context_seed, 0.8, query_id)
    
    if not runs:
        return {}

    combined_run = fuse(
        runs=runs,
        method="wsum",       # Weighted Sum
        norm="rank",         # Reciprocal rank normalization
        params={"weights": weights}
    )

    result_dict = combined_run.to_dict()
    return result_dict.get(query_id, {})


def add_run_if_not_empty(runs, weights, run_dict, weight, query_id):
    if run_dict:  # only add if not empty
        runs.append(Run({query_id: run_dict}))
        weights.append(weight)

def hits_to_run_dict(hits):
    run_dict = {}
    for hit in hits:
        doc_id = hit["_id"]
        score = hit["_score"]
        run_dict[doc_id] = score
    return run_dict

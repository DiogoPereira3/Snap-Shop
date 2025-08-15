from fastapi import FastAPI, UploadFile, Query, Form
from fastapi.middleware.cors import CORSMiddleware
from gemini import get_marketplace_label
import torch
import torchvision
import PIL
import time
import io
from scrapers import scrape_olx, scrape_vinted, scrape_wallapop
import requests
from typing import List
import random
from collections import defaultdict
import re
from fastapi.concurrency import run_in_threadpool
import httpx
import asyncio
import unicodedata


app = FastAPI()

origins = [
    "http://localhost:5173", 
    "http://localhost",  
    "http://127.0.0.1",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https://.*\\.uks1\\.devtunnels\\.ms",
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_scrapers(sources: List[str]):
    scrapers = []
    if "olx" in sources:
        scrapers.append(scrape_olx)
    if "vinted" in sources:
        scrapers.append(scrape_vinted)
    if "wallapop" in sources:
        scrapers.append(scrape_wallapop)
    return scrapers

weights = torchvision.models.MobileNet_V3_Large_Weights.DEFAULT
model = torchvision.models.mobilenet_v3_large(weights=weights)
model_features = torch.nn.Sequential(*list(model.children())[:-1])

model_features.eval()

transform = weights.transforms()

def extract_features(image_path):
    image = PIL.Image.open(image_path).convert('RGB')
    image = transform(image).unsqueeze(0)

    with torch.no_grad():
        features = model_features(image).view(-1)

    return features

def extract_features_from_url(image_url):
    try:
        download_time = 0.0
        extraction_time = 0.0
        start_download = time.perf_counter()
        response = requests.get(image_url)
        end_download = time.perf_counter()
        download_time = end_download - start_download
        
        image = PIL.Image.open(io.BytesIO(response.content)).convert('RGB')

        image = transform(image).unsqueeze(0)

        start_extraction = time.perf_counter()
        with torch.no_grad():
            features = model_features(image).view(-1)
        end_extraction = time.perf_counter()
        extraction_time = end_extraction - start_extraction
        
        return features, download_time, extraction_time
    
    except Exception as e:
        print(f"Erro ao processar imagem de URL: {image_url}, erro: {e}")
        return None, 0.0, 0.0

def interleave_marketplace_listings(listings: List[dict]) -> List[dict]:
    groups = defaultdict(list)
    for listing in listings:
        groups[listing["marketplace"]].append(listing)
    
    final = []
    index = 0
    marketplaces = list(groups.keys())
    
    while True:
        round_items = []
        for m in marketplaces:
            if index < len(groups[m]):
                round_items.append(groups[m][index])
        if not round_items:
            break
        random.shuffle(round_items) 
        final.extend(round_items)
        index += 1
        
    return final

def normalize_and_strip_non_alnum(s):
    s = ''.join(
        c for c in unicodedata.normalize('NFKD', s)
        if not unicodedata.combining(c)
    )
    s = re.sub(r'[^a-zA-Z0-9\s]', '', s)
    return s

@app.post("/deep")
async def search_products_image_deep(file: UploadFile,
                                 sources: str = Form("[]"),
                                 price_from: int = Form(None),
                                 price_to: int = Form(None),
                                 amount: int = Form()):

    import json
    selected_sources = json.loads(sources)
    scrapers = get_scrapers(selected_sources)
    
    total_start_time = time.perf_counter() 
    
    contents = await file.read()
    uploaded_image = io.BytesIO(contents)

    start_classification_time = time.perf_counter()
    label= await get_marketplace_label(contents, mime_type=file.content_type)
    end_classification_time = time.perf_counter()
    print(f"label: {label}")
    label = normalize_and_strip_non_alnum(label)
    print(f"Normalized label: {label}")
    uploaded_feature_vector = extract_features(uploaded_image)
    total_classification_time = end_classification_time - start_classification_time
    start_get_listings= time.perf_counter()
    listings = []
    tasks = []
    for scraper in scrapers:
        if asyncio.iscoroutinefunction(scraper):
            tasks.append(scraper(label, price_from, price_to, amount))
        else:
            tasks.append(run_in_threadpool(scraper, label, price_from, price_to, amount))
    results = await asyncio.gather(*tasks)
    for result in results:
        listings.extend(result)
    end_get_listings = time.perf_counter()
    total_get_listings_time = end_get_listings - start_get_listings
    
    listings_compared=[]
    total_download_time = 0.0
    total_extraction_time = 0.0
    total_similarity_time = 0.0
    
    for listing in listings:
        image_url = listing.get("image_url")
        if not image_url:
            continue
        
        listing_features, download_time, extraction_time = extract_features_from_url(image_url)
        total_download_time += download_time
        total_extraction_time += extraction_time

        if listing_features is None:
            continue
        
        start_similarity = time.perf_counter()
        similarity = torch.nn.functional.cosine_similarity(
            uploaded_feature_vector.unsqueeze(0),
            listing_features.unsqueeze(0)
        ).item()
        end_similarity = time.perf_counter()
        total_similarity_time += (end_similarity - start_similarity)

        listing["similarity"] = similarity
        listings_compared.append(listing)

    start_sorting_time = time.perf_counter()
    listings_compared.sort(key=lambda x: x["similarity"], reverse=True)
    print("\n--- Similarity scores for all listings (threshold 0.4) ---")
    for idx, listing in enumerate(listings_compared, 1):
        print(f"{idx}. {listing.get('title', '[no title]')} | Similarity: {listing['similarity']:.4f} | Store: {listing.get('marketplace', '[unknown]')}")
    listings_compared = [l for l in listings_compared if l["similarity"] >= 0.4]
    end_sorting_time = time.perf_counter()
    total_sorting_time = end_sorting_time - start_sorting_time
    
    total_end_time = time.perf_counter()
    
    print(f"Tempo de classificação da imagem: {end_classification_time - start_classification_time:.6f} segundos")
    print(f"Tempo de obter as listagens pela Hidden API: {total_get_listings_time:.6f} segundos")
    print(f"Tempo total de download: {total_download_time:.6f} segundos")
    print(f"Tempo total de extração: {total_extraction_time:.6f} segundos")
    print(f"Tempo total de similaridade: {total_similarity_time:.6f} segundos")
    print(f"Tempo total de ordenação: {total_sorting_time:.6f} segundos")
    print(f"Tempo de classificar a imagem, obter listagens, download, extração, similaridade e ordenação: {total_classification_time + total_get_listings_time + total_download_time + total_extraction_time + total_similarity_time + total_sorting_time:.6f} segundos")
    print(f"Tempo total: {total_end_time - total_start_time:.6f} segundos")
    
    return {
        "message": "Sucess!",
        "listings": listings_compared
    }
    
@app.post("/light")
async def search_products_image_light(file: UploadFile, sources: str = Form("[]"), price_from: int = Form(None), price_to: int = Form(None), amount: int = Form()):
    import json
    selected_sources = json.loads(sources)
    scrapers = get_scrapers(selected_sources)
    
    print(f"Selected sources: {selected_sources}")
    print(f"Scrapers: {scrapers}")
    
    total_start_time = time.perf_counter() 
    
    contents = await file.read()
    start_classification_time = time.perf_counter()
    label= await get_marketplace_label(contents, mime_type=file.content_type)
    end_classification_time = time.perf_counter()
    print(f"label: {label}")
    label = normalize_and_strip_non_alnum(label)
    print(f"Normalized label: {label}")
    
    start_get_listings= time.perf_counter()
    listings = []
    tasks = []
    for scraper in scrapers:
        if asyncio.iscoroutinefunction(scraper):
            tasks.append(scraper(label, price_from, price_to, amount))
        else:
            tasks.append(run_in_threadpool(scraper, label, price_from, price_to, amount))

    results = await asyncio.gather(*tasks)
    for result in results:
        listings.extend(result)
    end_get_listings = time.perf_counter()
    total_get_listings_time = end_get_listings - start_get_listings 
    
    total_end_time = time.perf_counter()
    print(f"Tempo de classificação da imagem: {end_classification_time - start_classification_time:.6f} segundos")
    print(f"Tempo de obter as listagens pelas Hidden API: {total_get_listings_time:.6f} segundos")
    print(f"Tempo total: {total_end_time - total_start_time:.6f} segundos")
    
    final = interleave_marketplace_listings(listings)   
    
    return {
        "message": "Sucess!",
        "listings": final
    }    
    
@app.get("/search")
async def search_products(query: str = Query(...), sources: str = Query("[]"), price_from: int = Query(None), price_to: int = Query(None), amount: int = Query()):
    import json
    query = normalize_and_strip_non_alnum(query)
    selected_sources = json.loads(sources)
    scrapers = get_scrapers(selected_sources)
    
    print(f"Selected sources: {selected_sources}")
    print(f"Scrapers: {scrapers}")

    listings = []
    tasks = []
    for scraper in scrapers:
        if asyncio.iscoroutinefunction(scraper):
            tasks.append(scraper(query, price_from, price_to, amount))
        else:
            tasks.append(run_in_threadpool(scraper, query, price_from, price_to, amount))

    results = await asyncio.gather(*tasks)
    for result in results:
        listings.extend(result)
        
    final = interleave_marketplace_listings(listings)    
    
    return {
        "message": f"Search for '{query}' completed.",
        "label": query,
        "listings": final
    }
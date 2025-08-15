# Snap-Shop

## Project Overview
Snap-Shop is a **Portuguese used-goods marketplace aggregator** that unifies listings from **OLX**, **Vinted**, and **Wallapop**.

### Key Features
- **Image-based search:** Upload a product image; a **multimodal LLM (Gemini 2.5 Flash Lite)** generates a precise Portuguese description used to query marketplaces.
- **Smart search (toggleable):** After scraping listings, the app downloads listing images and performs **feature extraction** on both the user’s image and the scraped images. Results are filtered by a **cosine-similarity** threshold and sorted by similarity.
- **Marketplace selection & filters:** Choose which marketplaces to include, set price intervals with dynamic quick-range buttons or a manual input box, and pick from multiple ordering options.
- **Responsive UI:** Optimized for different screen sizes.
- **Hidden API scraping:** Uses public but undocumented endpoints exposed by CSR sites to hydrate pages in browsers.

## Technologies Used

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** FastAPI (Python), Uvicorn
- **AI/ML:** Gemini API (`gemini-2.5-flash-lite-preview-06-17`), Image feature extraction using classification models such as ResNet-50 and MobileNetV3-Large, Image comparison through cossine similarity
- **Web Scraping:** Public but undocumented marketplace endpoints (OLX, Vinted, Wallapop)
- **Containerization:** Docker, Docker Compose

---

## Installation

This project uses Docker for both frontend and backend.

1. Create a `.env` file in the project root:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

2. Build and start the stack:
    ```bash
    docker-compose up --build
    ```

After starting:
- **Frontend:** [http://localhost:5173](http://localhost:5173)  
- **Backend:** [http://localhost:8000](http://localhost:8000)

---

## Important Notice

Snap-Shop depends on:
- **Hidden marketplace endpoints** from OLX, Vinted, and Wallapop, which may change or restrict access without notice.
- **Gemini API availability**, specifically `gemini-2.5-flash-lite-preview-06-17`.

As of **August 15, 2025**, these integrations work, but future changes on their side may impact functionality.

import httpx
import json
from cookie_fetcher import get_cookies
import datetime
import requests

def scrape_olx(label, price_from=None, price_to=None, amount=None):
    url = "https://www.olx.pt/apigateway/graphql"
    
    search_params=[{"key":"offset","value":"0"},
                               {"key":"limit","value": str(amount)},
                               {"key":"query","value":label},
                               {"key":"filter_refiners","value":"spell_checker"},
                               {"key":"suggest_filters","value":"true"},
                               {"key":"sl","value":"196910b2730x21a0714b"}]
    if price_from is not None:
        search_params.append({"key": "filter_float_price:from", "value": str(price_from)})
    if price_to is not None:
        search_params.append({"key": "filter_float_price:to", "value": str(price_to)})

    payload = json.dumps({
  "query": "query ListingSearchQuery(\n  $searchParameters: [SearchParameter!] = {key: \"\", value: \"\"}\n) {\n  clientCompatibleListings(searchParameters: $searchParameters) {\n    __typename\n    ... on ListingSuccess {\n      __typename\n      data {\n        id\n        location {\n          city {\n            id\n            name\n            normalized_name\n            _nodeId\n          }\n          district {\n            id\n            name\n            normalized_name\n            _nodeId\n          }\n          region {\n            id\n            name\n            normalized_name\n            _nodeId\n          }\n        }\n        last_refresh_time\n        delivery {\n          rock {\n            active\n            mode\n            offer_id\n          }\n        }\n        created_time\n        category {\n          id\n          type\n          _nodeId\n        }\n        contact {\n          courier\n          chat\n          name\n          negotiation\n          phone\n        }\n        business\n        omnibus_pushup_time\n        photos {\n          link\n          height\n          rotation\n          width\n        }\n        promotion {\n          highlighted\n          top_ad\n          options\n          premium_ad_page\n          urgent\n          b2c_ad_page\n        }\n        protect_phone\n        shop {\n          subdomain\n        }\n        title\n        status\n        url\n        user {\n          id\n          uuid\n          _nodeId\n          about\n          b2c_business_page\n          banner_desktop\n          banner_mobile\n          company_name\n          created\n          is_online\n          last_seen\n          logo\n          logo_ad_page\n          name\n          other_ads_enabled\n          photo\n          seller_type\n          social_network_account_type\n        }\n        offer_type\n        params {\n          key\n          name\n          type\n          value {\n            __typename\n            ... on GenericParam {\n              key\n              label\n            }\n            ... on CheckboxesParam {\n              label\n              checkboxParamKey: key\n            }\n            ... on PriceParam {\n              value\n              type\n              previous_value\n              previous_label\n              negotiable\n              label\n              currency\n              converted_value\n              converted_previous_value\n              converted_currency\n              arranged\n              budget\n            }\n            ... on SalaryParam {\n              from\n              to\n              arranged\n              converted_currency\n              converted_from\n              converted_to\n              currency\n              gross\n              type\n            }\n            ... on ErrorParam {\n              message\n            }\n          }\n        }\n        _nodeId\n        description\n        external_url\n        key_params\n        partner {\n          code\n        }\n        map {\n          lat\n          lon\n          radius\n          show_detailed\n          zoom\n        }\n        safedeal {\n          allowed_quantity\n          weight_grams\n        }\n        valid_to_time\n      }\n      metadata {\n        filter_suggestions {\n          category\n          label\n          name\n          type\n          unit\n          values {\n            label\n            value\n          }\n          constraints {\n            type\n          }\n          search_label\n        }\n        search_id\n        total_elements\n        visible_total_count\n        source\n        search_suggestion {\n          url\n          type\n          changes {\n            category_id\n            city_id\n            distance\n            district_id\n            query\n            region_id\n            strategy\n            excluded_category_id\n          }\n        }\n        facets {\n          category {\n            id\n            count\n            label\n            url\n          }\n          category_id_1 {\n            count\n            id\n            label\n            url\n          }\n          category_id_2 {\n            count\n            id\n            label\n            url\n          }\n          category_without_exclusions {\n            count\n            id\n            label\n            url\n          }\n          category_id_3_without_exclusions {\n            id\n            count\n            label\n            url\n          }\n          city {\n            count\n            id\n            label\n            url\n          }\n          district {\n            count\n            id\n            label\n            url\n          }\n          owner_type {\n            count\n            id\n            label\n            url\n          }\n          region {\n            id\n            count\n            label\n            url\n          }\n          scope {\n            id\n            count\n            label\n            url\n          }\n        }\n        new\n        promoted\n      }\n      links {\n        first {\n          href\n        }\n        next {\n          href\n        }\n        previous {\n          href\n        }\n        self {\n          href\n        }\n      }\n    }\n    ... on ListingError {\n      __typename\n      error {\n        code\n        detail\n        status\n        title\n        validation {\n          detail\n          field\n          title\n        }\n      }\n    }\n  }\n}\n",
  "variables":
                            {"searchParameters":
                              search_params}})
    
    headers = {
  'accept': 'application/json',
  'accept-language': 'pt',
  'cache-control': 'no-cache',
  'content-type': 'application/json',
  'origin': 'https://www.olx.pt',
  'pragma': 'no-cache',
  'priority': 'u=1, i',
  'referer': 'https://www.olx.pt/ads/q-{label}/',
  'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
  'Cookie': 'deviceGUID=f43ed19a-e799-4004-a5c9-421059738eec; OptanonAlertBoxClosed=2025-04-29T21:57:12.487Z; eupubconsent-v2=CQQoFRgQQoFRgAcABBENBnF8AP_gAAAAAAYgJwtX3G_fbXlj-T50aftkeY1f99h6rsQxBgbJk-4FyLvW_JwX32EzNAx6pqYKmRIAu3TBIQFlGIDUBUCgaogVrTDMaEyEoTNKJ6BEiFMRY2dYCFxvm4FDeQCY5trtd1c52R-t7dr83dzyy4hnn3Kp_2S1WJCdAYcgAAAAAAAAAAAAAAAQAAAAFAAAAQAIAAAAAAAAAAAAAAAAAAAAF_YAAACgkEAABAAC4AKAAqABwADwAIIAXgBqADwAJgAVQA3gB6AD8AISAQwBEgCOAEsAK0AYAAw4BlAGWANkAc8A7gDvgHsAfEA-wD9AIAARSAi4CMAEaAJLAT8BQYCoAKuAXMAvQBigDRAG0ANwAcQBDsCPQJEATsAocBR4CkQFNgLYAXIAu8BeYDDYGRgZIAycBlwDMwGcwNXA1kBsYDbwG6gOTAcuBC4IAXAAcACQAI4BBwCOAE0AL6AlYBMoCbQFIALCAWIAvIBf4DEAGLAMhAaMA1MBtADbgG6DgFAACIAHAAeABcAEgAPwAjgBoAEcAOQAgEBBwEIAI4ATQAqAB0gEIAJWATEAmUBNoCkwFdgLEAWoAugBf4DEAGLAMhAZMA0YBqYDXgG0ANsAbcA3QBx4DloHOgc-OgkAALgAoACoAHAAQQAuADUAHgATAAqwBcAF0AMQAbwA9AB-gEMARIAlgBRgCtAGAAMMAZQA0QBsgDngHcAd4A9oB9gH7ARQBGICOgJLAT8BQYCogKuAWIAucBeQF6AMUAbQA3ABxADqAH2AQ6Ai-BHoEiAJkATsAoeBR4FIQKaApsBVgCxQFsALdAXAAuQBdoC7wF5gL6AYaAx6BkYGSAMnAZVAywDLgGZgM5AabA1cDWAG3gN1AcWA5MBy5AAmAAgAB4AaAByAEcALEAX0BNoCkwFiALyAZ4A0YBqYDbAG3AN0AcsA58hAeAAWABQAFwANQAqgBcADEAG8APQAwABzwDuAO8AigBKQCgwFRAVcAuYBigDaAHUAR6ApoBVgCxQFogLgAXIAyMBk4DOSUCIABAACwAKAAcAB4AEwAKoAXAAxQCGAIkARwAowBWgDAAGyAO8AfkBUQFXALmAYoA6gCHQETAIvgR6BIgCjwFigLYAXnAyMDJAGTgM5AawA28kASAAuAEcAdwBAACDgEcAKgAlYBMQCbQFJgL_AYsAywBngDcgG6AOWKQOgAFwAUABUADgAIAAaAA8ACYAFUAMQAfoBDAESAKMAVoAwABlADRAGyAOcAd8A_AD9AIsARiAjoCSgFBgKiAq4BcwC8gGKANoAbgA6gB7QD7AIdARMAi-BHoEiAJ2AUOApABTYCrAFigLYAXAAuQBdoC8wF9AMNgZGBkgDJ4GWAZcAzmBrAGsgNvAbqA5MoAdAAuACQAFwAMgAjgCOAHIAO4AfYBAACDgFiANeAdsA_4CYgE2gKkAV2AugBeQDFgGTAM8AaMA1MBrwDdAHLAAA.f_wAAAAAAAAA; OTAdditionalConsentString=1~89.318.320.959.1421.1423.1659.1985.1987.2008.2072.2135.2322.2465.2501.2958.2999.3028.3225.3226.3231.3234.3235.3236.3237.3238.3240.3244.3245.3250.3251.3253.3257.3260.3270.3272.3281.3288.3290.3292.3293.3296.3299.3300.3306.3307.3309.3314.3315.3316.3318.3324.3328.3330.3331.3531.3731.3831.4131.4531.4631.4731.4831.5231.6931.7235.7831.7931.8931.9731.10231.10631.10831.11031.11531.12831.13632.13731.14034.14133.14237.14332.15731.16831.16931.21233.23031.25131.25731.25931.26031.26831.27731.27831.28031.28731.28831.29631.32531.33631.34231.34631.36831.39131.39531.40632.41531.43631.43731.43831; session_start_date=1750257597996; lqstatus=1750257179|196838dd462x5688a3c7|eus-1623|||0; laquesis=carparts-114^@b^#eupp-3280^@b^#eupp-3283^@a^#eupp-3395^@a; laquesisff=aut-1425^#aut-388^#buy-2279^#buy-2489^#de-2724^#decision-657^#euonb-114^#eus-1773^#f8nrp-1779^#kuna-307^#mart-1341^#oec-1238^#oesx-1437^#oesx-2798^#oesx-2864^#oesx-2926^#oesx-3713^#oesx-645^#oesx-867^#olxeu-32943^#posting-1419^#posting-1638^#srt-1289^#srt-1346^#srt-1434^#srt-1593^#srt-1758^#srt-651^#uacc-529^#udp-1535; PHPSESSID=0bhnc86squ1h5nu6od92oj9d7b; ldTd=true; OptanonConsent=isGpcEnabled=0&datestamp=Wed+Jun+18+2025+15%3A13%3A12+GMT%2B0100+(Hor%C3%A1rio+de+Ver%C3%A3o+da+Europa+Ocidental)&version=202401.2.0&browserGpcFlag=0&isIABGlobal=false&hosts=&genVendors=V10%3A0%2C&consentId=450405cd-7ee7-4588-9290-9a26f1a589e8&interactionCount=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A1%2Cgad%3A1&geolocation=US%3BNY&AwaitingReconsent=false; onap=196838dd462x5688a3c7-9-19783600adbx3bda2a95-24-1750257806; PHPSESSID=vi13nr6cl2f7rcmtnm5gl2deej'
}
    
    response = requests.request("POST", url, headers=headers, data=payload)
    data = response.json()

    try:
        listings = [
          listing for listing in data['data']['clientCompatibleListings']['data']
          if not listing.get("promotion", {}).get("top_ad", False)
        ]
    except KeyError:
        print("Could not extract listings from olx.")
        return []

    results = []
    for listing in listings:
        photos = listing.get('photos', [])
        if not photos:
            continue
        
        raw_link = photos[0].get('link')
        if not raw_link:
            continue

        width_original = photos[0].get('width')
        height_original = photos[0].get('height')
        image_url = raw_link.replace("{width}", "232").replace("{height}", "232")
        image_url_original = raw_link.replace("{width}", str(width_original)).replace("{height}", str(height_original))
        title = listing.get('title', 'Sem título')
        url = listing.get('url', 'Sem URL')

        price = "N/A"
        for param in listing.get("params", []):
            if param.get("key") == "price":
                val = param.get("value", {})
                if isinstance(val, dict):
                    price = val.get("label", "N/A")
                break
            
        last_refresh_time = listing.get("last_refresh_time")
        if last_refresh_time:
            dt = datetime.datetime.fromisoformat(last_refresh_time)
            timestamp_ms = int(dt.timestamp() * 1000)
        else:
            timestamp_ms = None

        results.append({
            "title": title,
            "price": price,
            "image_url": image_url,
            "imagem_url_original": image_url_original,
            "url": url,
            "marketplace": "OLX",
            "date": timestamp_ms
        })

    return results

async def scrape_vinted(label, price_from=None, price_to=None, amount=None):
        url=f"https://www.vinted.pt/api/v2/catalog/items?page=1&per_page={amount}&search_text={label}"
        
        if price_from is not None:
            url += f"&price_from={price_from}"
        if price_to is not None:
            url += f"&price_to={price_to}"
        if price_from is not None or price_to is not None:
            url += f"&currency=EUR"

        cookies= await get_cookies("https://www.vinted.pt")
        
        payload = {}
        headers = {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'pt-fr',
        'cache-control': 'no-cache',
        'pragma': 'no-cache',
        'priority': 'u=1, i',
        'referer': f'https://www.vinted.pt/catalog?search_text={label}&page=1',
        'sec-ch-ua': '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
        'x-anon-id': '6f6f3c4d-0252-49a9-ab45-50eda2f468a3',
        'x-csrf-token': '75f6c9fa-dc8e-4e52-a000-e09dd4084b3e',
        'x-money-object': 'true',
        'Cookie': cookies
        }
    
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            data = response.json()
            
        try:
            listings = data.get("items", [])
        except (KeyError, json.JSONDecodeError):
            print("Could not extract listings from Vinted.")
            return []


        results = []

        for listing in listings:
            photo = listing.get("photo", {})
            thumbnails = photo.get("thumbnails", [])

            # Find the smallest image that is at least 232x232
            suitable_thumb = next(
                (thumb for thumb in sorted(thumbnails, key=lambda x: x['width'] * x['height'])
                if thumb.get("width", 0) >= 232 and thumb.get("height", 0) >= 232),
                None
            )

            if not photo or "url" not in photo:
                continue

            image_url_original = photo["url"]
            image_url = suitable_thumb["url"] if suitable_thumb else image_url_original

            title = listing.get("title", "Sem título")
            url = listing.get("url", "Sem URL")
            price_data = listing.get("price", {})
            amount = price_data.get('amount', 'N/A')
            try:
                amount = float(amount)
                if amount.is_integer():
                    amount = int(amount)
                price = f"{amount} €"
            except Exception:
                price = "N/A"
            
            date = None
            high_res = photo.get("high_resolution", {})
            if isinstance(high_res, dict):
                timestamp = high_res.get("timestamp")
                date = int(timestamp) * 1000
            

            results.append({
                "title": title,
                "price": price,
                "image_url": image_url,
                "imagem_url_original": image_url_original,
                "url": url,
                "marketplace": "Vinted",
                "date": date
            })

        return results

async def scrape_wallapop(label, price_from=None, price_to=None, amount=None): 
    url = f"https://api.wallapop.com/api/v3/search?keywords={label}&source=deep_link"
    
    if price_from is not None:
        url += f"&min_sale_price={price_from}"
    if price_to is not None:
        url += f"&max_sale_price={price_to}"

    payload = {}
    headers = {
    'Accept': 'application/json, text/plain, */*',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Origin': 'https://pt.wallapop.com',
    'Pragma': 'no-cache',
    'Referer': 'https://pt.wallapop.com/',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
    'accept-language': 'pt,pt-BR;q=0.9',
    'deviceos': '0',
    'mpid': '-1084703080692325821',
    'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'x-appversion': '85680',
    'x-deviceid': 'ecc16a61-aae3-4dce-8473-73ebe3f841ef',
    'x-deviceos': '0'
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        data = response.json()
    
    results = []
    try:
        items = data["data"]["section"]["payload"]["items"]
    except KeyError:
        print("Unexpected JSON structure")
        return []

    for item in items:
        title = item.get("title", "")
        price_info = item.get("price", {})
        amount = price_info.get("amount", 0)
        currency = price_info.get("currency", "")
        try:
            amount = float(amount)
            if amount.is_integer():
                amount = int(amount)
        except Exception:
            pass

        if currency == "EUR":
            price = f"{amount} €"
        elif currency:
            price = f"{amount} {currency}"
        else:
            price = f"{amount}"
        

        images = item.get("images", [])
        if images:
            image_url = images[0]["urls"].get("small")
            image_url_original = images[0]["urls"].get("big")
        else:
            image_url = image_url_original = None

        web_slug = item.get("web_slug", "")
        url = f"https://pt.wallapop.com/item/{web_slug}" if web_slug else None

        date = item.get("modified_at", None)
        
        results.append({
            "title": title,
            "price": price,
            "image_url": image_url,
            "imagem_url_original": image_url_original,
            "url": url,
            "marketplace": "Wallapop",
            "date": date
        })

    return results
    
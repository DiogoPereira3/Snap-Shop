import httpx

async def get_cookies(url):
    headers = {
        'accept': 'application/json, text/plain, */*',
  'accept-language': 'pt-fr',
  'cache-control': 'no-cache',
  'pragma': 'no-cache',
  'priority': 'u=1, i',
  'referer': 'https://www.vinted.pt/',
  'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
  'x-anon-id': 'ea64abea-7132-4d08-945c-0d6d844313b4',
  'x-csrf-token': '75f6c9fa-dc8e-4e52-a000-e09dd4084b3e'
    }

    async with httpx.AsyncClient(headers=headers) as client:
        response = await client.get(url)
        cookies = response.cookies.jar

    cookie_header = '; '.join([f"{cookie.name}={cookie.value}" for cookie in cookies])
    return cookie_header
import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from news.news_service import fetch_live_agri_news

def test_farmer_info_center():
    print("=================================================================")
    print("🌾 TESTING LIVE INDIAN FARMER INFORMATION CENTER")
    print("Farmer Profile Context: Warangal, Telangana | Crops: Paddy, Tomato, Cotton, Chilli")
    print("=================================================================")
    
    res = fetch_live_agri_news(
        location="Warangal, Telangana",
        crops="Paddy, Tomato, Cotton, Chilli",
        limit=15,
        force_refresh=True
    )
    
    articles = res.get("articles", [])
    print(f"Total farmer-actionable items retrieved: {len(articles)}")
    print(f"Last updated: {res.get('last_updated')}")
    print(f"Source: {res.get('source')}\n")
    
    for i, a in enumerate(articles):
        print(f"[{i+1}] {a.get('category')} | Crop: {a.get('crop') or 'General'} | Loc: {a.get('location_tag')} | Score: {a.get('relevance_score')}/100")
        print(f"     Title: {a.get('title')}")
        print(f"     Date: {a.get('date')} | Source: {a.get('source')}")
        if a.get('price_info'):
            p = a.get('price_info')
            print(f"     💰 Price Info: {p.get('crop')} @ {p.get('price')} in {p.get('market')} ({p.get('price_type')})")
        print(f"     Img: {a.get('image_url')}")
        print()

if __name__ == "__main__":
    test_farmer_info_center()

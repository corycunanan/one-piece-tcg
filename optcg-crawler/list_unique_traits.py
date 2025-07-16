import csv
import json

traits = set()

with open('optcg-crawler/all_cards_components.csv', newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        try:
            # Some rows may have empty or malformed traits
            trait_list = json.loads(row['traits'].replace("'", '"'))
            for trait in trait_list:
                traits.add(trait['value'])
        except Exception:
            pass

for trait in sorted(traits):
    print(trait) 
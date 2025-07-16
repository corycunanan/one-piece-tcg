import csv
import argparse
import os
import re
from bs4 import BeautifulSoup
import glob
import json

# File paths
HTML_FILE = 'cardlist.html'
CSV_FILE = 'onepiece_cards_modal.csv'

# Set code to full name mapping
SET_CODE_MAPPING = {
    'OP01': 'OP01 - Romance Dawn',
    'OP02': 'OP02 - Paramount War', 
    'OP03': 'OP03 - Pillars of Strength',
    'OP04': 'OP04 - Kingdoms of Intrigue',
    'OP05': 'OP05 - Awakening of the New Era',
    'OP06': 'OP06 - Wings of the Captain',
    'OP07': 'OP07 - 500 Years in the Future',
    'OP08': 'OP08 - Two Legends',
    'OP09': 'OP09 - Emperors in the New World',
    'OP10': 'OP10 - Royal Blood',
    'OP11': 'OP11 - A Fist of Divine Speed',
    'EB01': 'EB01 - Memorial Collection',
    'EB02': 'EB02 - Anime 25th Collection',
    'PRB01': 'PRB01 - One Piece The Best',
    'ST01': 'ST01 - Straw Hat Crew',
    'ST02': 'ST02 - Worst Generation',
    'ST03': 'ST03 - The Seven Warlords of the Sea',
    'ST04': 'ST04 - Animal Kingdom Pirates',
    'ST05': 'ST05 - One Piece Film Edition',
    'ST06': 'ST06 - Absolute Justice',
    'ST07': 'ST07 - Big Mom Pirates',
    'ST08': 'ST08 - Monkey D. Luffy',
    'ST09': 'ST09 - Yamato',
    'ST10': 'ST10 - The Three Captains',
    'ST11': 'ST11 - Uta',
    'ST12': 'ST12 - Zoro & Sanji',
    'ST13': 'ST13 - The Three Brothers',
    'ST14': 'ST14 - 3D2Y',
    'ST15': 'ST15 - Edward.Newgate',
    'ST16': 'ST16 - Uta',
    'ST17': 'ST17 - Donquixote Doflamingo',
    'ST18': 'ST18 - Monkey.D.Luffy',
    'ST19': 'ST19 - Smoker',
    'ST20': 'ST20 - Charlotte Katakuri',
    'ST21': 'ST21 - EX - Gear 5',
    'ST22': 'ST22 - Ace & Newgate',
    'ST23': 'ST23 - Shanks',
    'ST24': 'ST24 - Jewelry Bonney',
    'ST25': 'ST25 - Buggy',
    'ST26': 'ST26 - Monkey.D.Luffy',
    'ST27': 'ST27 - Marshall.D.Teach',
    'ST28': 'ST28 - Yamato',
    'P': 'Promotional Cards'
}

# Helper to build full image URL if needed
def build_image_url(data_src):
    if data_src.startswith('..'):
        return 'https://en.onepiece-cardgame.com' + data_src[2:]
    return data_src

def get_direct_text(tag):
    if tag:
        # Get all direct text nodes (not from children)
        texts = [t for t in tag.find_all(string=True, recursive=False) if t.strip()]
        return texts[0].strip() if texts else ''
    return ''

def get_card_type(card):
    info_col = card.select_one('.infoCol')
    if info_col:
        spans = info_col.find_all('span')
        if len(spans) >= 3:
            return spans[2].text.strip().upper()
    return ''

def get_life(card):
    # For leaders, the life value is in the .cost div with "Life" as the h3 text
    cost_tag = card.select_one('.cost')
    if cost_tag:
        h3_text = cost_tag.find('h3')
        if h3_text and h3_text.text.strip() == 'Life':
            return get_direct_text(cost_tag)
    return ''

def get_counter(card):
    counter_tag = card.select_one('.counter')
    if counter_tag:
        return get_direct_text(counter_tag)
    return ''

def get_color(card):
    color_tag = card.select_one('.color')
    if color_tag:
        return get_direct_text(color_tag)
    return ''

def get_card_types(card):
    feature_tag = card.select_one('.feature')
    if feature_tag:
        # Get the text after the "Type" label
        type_text = get_direct_text(feature_tag)
        if type_text:
            # Split by "/" and join with commas
            types = [t.strip() for t in type_text.split('/') if t.strip()]
            return ', '.join(types)
    return ''

def get_power(card):
    """Extract power value from card - this might need to be enhanced based on HTML structure"""
    # Look for power in various locations
    power_tag = card.select_one('.power')
    if power_tag:
        return get_direct_text(power_tag)
    
    # Alternative: look for power in the effect text or other attributes
    effect_tag = card.select_one('.text')
    if effect_tag:
        effect_text = effect_tag.text
        # Look for power patterns like "+1000", "5000 power", etc.
        power_match = re.search(r'(\d+)\s*power', effect_text, re.IGNORECASE)
        if power_match:
            return power_match.group(1)
    
    return ''

def determine_rarity_from_card_id(card_id):
    """Determine rarity from card ID patterns"""
    if not card_id:
        return ''
    # Common patterns for rarity
    card_id_lower = card_id.lower()
    if '_p' in card_id_lower:
        return 'P'  # Promotional
    elif '_r' in card_id_lower:
        return 'R'  # Rare
    elif '_sr' in card_id_lower:
        return 'SR'  # Super Rare
    elif '_sec' in card_id_lower:
        return 'SEC'  # Secret
    elif '_l' in card_id_lower:
        return 'L'  # Leader
    elif 'don' in card_id_lower:
        return 'DON'  # Don card
    # Default to Common if no pattern matches
    return 'C'

def get_rarity(card, card_id=None):
    """Extract rarity from card, fallback to card_id pattern if not found in HTML"""
    # Try to extract rarity as the second <span> in .infoCol
    info_col = card.select_one('.infoCol')
    if info_col:
        spans = info_col.find_all('span')
        if len(spans) >= 2:
            rarity_text = spans[1].text.strip()
            if rarity_text:
                return rarity_text
    # Fallback: use card_id pattern
    if card_id:
        return determine_rarity_from_card_id(card_id)
    return ''

def extract_set_from_card_id(card_id):
    """Extract set code from card ID and map to full set name"""
    if not card_id:
        return ''
    
    # Handle P- cards (promotional cards)
    if card_id.startswith('P-'):
        return SET_CODE_MAPPING.get('P', 'Promotional Cards')
    
    # Extract set code (e.g., "EB01-001" -> "EB01")
    set_match = re.match(r'^([A-Z]{2,3}\d{2})', card_id)
    if set_match:
        set_code = set_match.group(1)
        return SET_CODE_MAPPING.get(set_code, '')
    
    return ''

def parse_cards_from_html(html_file):
    with open(html_file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    cards = []
    for card in soup.select('dl.modalCol'):
        card_id_raw = card.get('id', '')
        card_id = card_id_raw[0].strip() if isinstance(card_id_raw, list) else str(card_id_raw).strip()
        name_tag = card.select_one('.cardName')
        name = name_tag.text.strip() if name_tag else ''
        card_type = get_card_type(card)
        if card_type == 'LEADER':
            cost = ''
            life = get_life(card)
        else:
            cost_tag = card.select_one('.cost')
            cost = get_direct_text(cost_tag)
            life = ''
        attribute_tag = card.select_one('.attribute i')
        attribute = attribute_tag.text.strip() if attribute_tag else ''
        img_tag = card.select_one('img.lazy')
        image_url = build_image_url(img_tag['data-src']) if img_tag and img_tag.has_attr('data-src') else ''
        local_image = f"{card_id}.jpg" if card_id else ''
        effect_tag = card.select_one('.text')
        effect_text = effect_tag.text.replace('Effect', '').strip() if effect_tag else ''
        trigger_tag = card.select_one('.trigger')
        trigger_text = trigger_tag.text.replace('Trigger', '').strip() if trigger_tag else ''
        # Remove leading symbols like [] from trigger text
        if trigger_text.startswith('[]'):
            trigger_text = trigger_text[2:].strip()
        elif trigger_text.startswith('['):
            # Find the closing bracket and remove everything up to it
            end_bracket = trigger_text.find(']')
            if end_bracket != -1:
                trigger_text = trigger_text[end_bracket + 1:].strip()
        
        counter = get_counter(card)
        color = get_color(card)
        types = get_card_types(card)
        power = get_power(card)
        rarity = get_rarity(card, card_id)
        set_name = extract_set_from_card_id(card_id)

        cards.append({
            'cardId': card_id,
            'name': name,
            'cardType': card_type,
            'life': life,
            'cost': cost,
            'power': power,
            'attribute': attribute,
            'types': types,
            'counter': counter,
            'color': color,
            'imageUrl': image_url,
            'localImage': local_image,
            'effectText': effect_text,
            'triggerText': trigger_text,
            'rarity': rarity,
            'set': set_name,
        })
    return cards

def read_existing_cards(csv_file):
    """Read existing cards from CSV to avoid duplicates"""
    existing_cards = {}
    if os.path.exists(csv_file):
        with open(csv_file, 'r', newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                existing_cards[row['cardId']] = row
    return existing_cards

def write_cards_to_csv(cards, csv_file, append_mode=False):
    fieldnames = ['cardId', 'name', 'cardType', 'life', 'cost', 'power', 'attribute', 'types', 'counter', 'color', 'imageUrl', 'localImage', 'effectText', 'triggerText', 'rarity', 'set']
    
    if append_mode and os.path.exists(csv_file):
        # Read existing cards
        existing_cards = read_existing_cards(csv_file)
        
        # Merge new cards, overwriting existing ones with same cardId
        for card in cards:
            existing_cards[card['cardId']] = card
        
        # Write all cards back
        with open(csv_file, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for card in existing_cards.values():
                writer.writerow(card)
        
        return len(existing_cards)
    else:
        # Write new file
        with open(csv_file, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for card in cards:
                writer.writerow(card)
        
        return len(cards)

def convert_to_component_arrays(csv_file, output_file=None):
    """
    Convert CSV columns to component array format for Strapi
    This creates a new CSV with component array columns
    """
    if output_file is None:
        base_name = os.path.splitext(csv_file)[0]
        output_file = f"{base_name}_components.csv"
    
    component_cards = []
    
    with open(csv_file, 'r', newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            # Convert attributes to component array
            attributes = []
            if row['attribute']:
                for attr in row['attribute'].split('/'):
                    attr = attr.strip()
                    if attr:
                        attributes.append({
                            'name': attr,
                            'value': attr
                        })
            
            # Convert types/traits to component array
            traits = []
            if row['types']:
                for trait in row['types'].split(', '):
                    traits.append({
                        'name': trait.strip(),
                        'value': trait.strip()
                    })
            
            # Convert colors to component array
            colors = []
            if row['color']:
                for color in row['color'].split('/'):
                    colors.append({
                        'name': color.strip(),
                        'value': color.strip()
                    })
            
            # Convert images to component array
            images = []
            if row['imageUrl']:
                images.append({
                    'url': row['imageUrl'],
                    'alt': row['name'],
                    'localPath': row['localImage']
                })
            
            # Create component array strings (JSON-like format for CSV)
            attributes_json = str(attributes).replace("'", '"')
            traits_json = str(traits).replace("'", '"')
            colors_json = str(colors).replace("'", '"')
            images_json = str(images).replace("'", '"')
            
            # Fix rarity value if needed
            rarity = row['rarity'].strip()
            if rarity == 'SP CARD':
                rarity = 'SP'
            
            # Convert effectText to Strapi rich text blocks format
            if row['effectText']:
                effectText_json = json.dumps([{
                    "type": "paragraph",
                    "children": [{"text": row['effectText']}]
                }])
            else:
                effectText_json = json.dumps([])
            
            # Normalize cardType to allowed Strapi values
            CARD_TYPE_ALLOWED = {"LEADER", "CHARACTER", "EVENT", "STAGE"}
            card_type = row['cardType'].strip().upper()
            if card_type not in CARD_TYPE_ALLOWED:
                card_type = ''
            
            component_cards.append({
                'cardId': row['cardId'],
                'name': row['name'],
                'cardType': card_type,
                'life': row['life'],
                'cost': row['cost'],
                'power': row['power'],
                'attributes': attributes_json,
                'traits': traits_json,
                'counter': row['counter'],
                'colors': colors_json,
                'images': images_json,
                'effectText': effectText_json,
                'triggerText': row['triggerText'],
                'rarity': rarity,
                'set': row['set'],
            })
    
    # Write component array CSV
    fieldnames = ['cardId', 'name', 'cardType', 'life', 'cost', 'power', 'attributes', 'traits', 'counter', 'colors', 'images', 'effectText', 'triggerText', 'rarity', 'set']
    
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for card in component_cards:
            writer.writerow(card)
    
    print(f"Converted {len(component_cards)} cards to component array format: {output_file}")
    return output_file

def main():
    parser = argparse.ArgumentParser(description='Parse One Piece card HTML files to CSV')
    parser.add_argument('input_html', nargs='?', help='Input HTML file path (optional if using --directory)')
    parser.add_argument('-o', '--output', help='Output CSV file path (default: input_name.csv)')
    parser.add_argument('-a', '--append', action='store_true', help='Append to existing CSV file instead of overwriting')
    parser.add_argument('-d', '--directory', help='Directory containing HTML files to process')
    parser.add_argument('-c', '--components', action='store_true', help='Convert to component array format after parsing')
    
    args = parser.parse_args()
    
    html_files = []
    if args.directory:
        html_files.extend(sorted(glob.glob(os.path.join(args.directory, '**', '*.html'), recursive=True)))
    if args.input_html:
        html_files.append(args.input_html)
    
    if not html_files:
        print('Error: No HTML files specified.')
        return
    
    # Generate output filename if not provided
    if not args.output:
        if args.directory:
            args.output = 'all_cards.csv'
        else:
            base_name = os.path.splitext(html_files[0])[0]
            args.output = f"{base_name}.csv"
    
    all_cards = []
    for html_file in html_files:
        if not os.path.exists(html_file):
            print(f"Warning: Input file '{html_file}' not found. Skipping.")
            continue
        all_cards.extend(parse_cards_from_html(html_file))
    
    # Remove duplicates by cardId (last occurrence wins)
    unique_cards = {}
    for card in all_cards:
        unique_cards[card['cardId']] = card
    total_cards = write_cards_to_csv(list(unique_cards.values()), args.output, append_mode=args.append)
    
    print(f"Parsed {len(unique_cards)} cards from {len(html_files)} file(s) and wrote to '{args.output}' (total: {total_cards} cards)")
    
    # Convert to component arrays if requested
    if args.components:
        convert_to_component_arrays(args.output)

if __name__ == '__main__':
    main() 
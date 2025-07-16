#!/usr/bin/env python3
"""
Convert existing CSV files to component array format for Strapi import
"""

import csv
import json
import argparse
import os
import re

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
    'ST15': 'ST15 - Edward Newgate',
    'ST16': 'ST16 - Uta',
    'ST17': 'ST17 - Donquixote Doflamingo',
    'ST18': 'ST18 - Monkey D. Luffy',
    'ST19': 'ST19 - Smoker',
    'ST20': 'ST20 - Charlotte Katakuri',
    'ST21': 'ST21 - Gear 5',
    'ST22': 'ST22 - Ace & Newgate'
}

def extract_set_from_card_id(card_id):
    """Extract set code from card ID and map to full set name"""
    if not card_id:
        return ''
    
    # Extract set code (e.g., "EB01-001" -> "EB01")
    set_match = re.match(r'^([A-Z]{2,3}\d{2})', card_id)
    if set_match:
        set_code = set_match.group(1)
        return SET_CODE_MAPPING.get(set_code, '')
    
    return ''

def extract_power_from_effect(effect_text):
    """Extract power value from effect text using regex patterns"""
    if not effect_text:
        return ''
    
    # Look for power patterns like "+1000", "5000 power", etc.
    power_patterns = [
        r'(\d+)\s*power',  # "5000 power"
        r'\+(\d+)\s*power',  # "+1000 power"
        r'(\d+)\s*base\s*power',  # "5000 base power"
    ]
    
    for pattern in power_patterns:
        match = re.search(pattern, effect_text, re.IGNORECASE)
        if match:
            return match.group(1)
    
    return ''

def determine_rarity_from_card_id(card_id):
    """Determine rarity from card ID patterns"""
    if not card_id:
        return ''
    
    # Common patterns for rarity
    if '_p' in card_id.lower():
        return 'P'  # Promotional
    elif '_r' in card_id.lower():
        return 'R'  # Rare
    elif '_sr' in card_id.lower():
        return 'SR'  # Super Rare
    elif '_sec' in card_id.lower():
        return 'SEC'  # Secret
    elif '_l' in card_id.lower():
        return 'L'  # Leader
    elif 'don' in card_id.lower():
        return 'DON'  # Don card
    
    # Default to Common if no pattern matches
    return 'C'

def get_base_card_id(card_id):
    """Strip _pX or similar suffixes to get the base cardId."""
    return re.sub(r'_p\d+$', '', card_id)

def get_variant_label(card_id):
    match = re.search(r'_p(\d+)$', card_id)
    if match:
        return f"p{match.group(1)}"
    return "default"

def convert_to_component_arrays(input_csv, output_csv=None):
    """
    Convert CSV columns to component array format for Strapi
    """
    if output_csv is None:
        base_name = os.path.splitext(input_csv)[0]
        output_csv = f"{base_name}_components.csv"
    
    # Group rows by base cardId
    card_groups = {}
    main_rows = {}
    with open(input_csv, 'r', newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            card_id = row.get('cardId', '')
            base_card_id = get_base_card_id(card_id)
            if base_card_id not in card_groups:
                card_groups[base_card_id] = []
            card_groups[base_card_id].append(row)
            # Save the main row (no _pX suffix)
            if card_id == base_card_id:
                main_rows[base_card_id] = row

    component_cards = []
    for base_card_id, variants in card_groups.items():
        # Use the main row for all non-image fields
        main_row = main_rows.get(base_card_id, variants[0])
        # Merge images from all variants
        images = []
        for row in variants:
            card_id = row.get('cardId', '')
            label = get_variant_label(card_id)
            is_default = (label == 'default')
            # Parse images field (may be a JSON array string or a single image dict)
            images_field = row.get('images') or row.get('imageUrl')
            if images_field:
                try:
                    img_list = json.loads(images_field)
                    if isinstance(img_list, dict):
                        img_list = [img_list]
                except Exception:
                    # Fallback: treat as single image URL
                    img_list = [{"url": images_field, "alt": row.get('name', ''), "localPath": row.get('localImage', '')}]
                for img in img_list:
                    images.append({
                        "label": label,
                        "image_url": img.get('url', ''),
                        "artist": "",  # No artist info available
                        "is_default": is_default
                    })
        # Sort images so default comes first
        images.sort(key=lambda x: not x['is_default'])
        # Prepare output row
        power = extract_power_from_effect(main_row.get('effectText', ''))
        rarity = determine_rarity_from_card_id(main_row.get('cardId', ''))
        set_name = extract_set_from_card_id(main_row.get('cardId', ''))
        attributes_json = main_row.get('attributes', '')
        traits_json = main_row.get('traits', '')
        colors_json = main_row.get('colors', '')
        effect_blocks_json = main_row.get('effect_description', '')
        trigger_blocks_json = main_row.get('trigger_effect', '')
        component_cards.append({
            'cardId': base_card_id,
            'name': main_row.get('name', ''),
            'cardType': main_row.get('cardType', ''),
            'life': main_row.get('life', ''),
            'cost': main_row.get('cost', ''),
            'power': power,
            'attributes': attributes_json,
            'traits': traits_json,
            'counter': main_row.get('counter', ''),
            'colors': colors_json,
            'images': json.dumps(images, ensure_ascii=False),
            'effect_description': effect_blocks_json,
            'trigger_description': main_row.get('triggerText', ''),
            'has_trigger': bool(main_row.get('triggerText', '').strip()),
            'trigger_effect': trigger_blocks_json,
            'rarity': rarity,
            'set': set_name,
        })

    # Write component array CSV
    fieldnames = [
        'cardId', 'name', 'cardType', 'life', 'cost', 'power', 
        'attributes', 'traits', 'counter', 'colors', 'images', 
        'effect_description', 'trigger_description', 'has_trigger', 
        'trigger_effect', 'rarity', 'set'
    ]
    with open(output_csv, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for card in component_cards:
            writer.writerow(card)
    print(f"Converted {len(component_cards)} cards to grouped component array format: {output_csv}")
    return output_csv

def main():
    parser = argparse.ArgumentParser(description='Convert CSV to component array format for Strapi')
    parser.add_argument('input_csv', help='Input CSV file path')
    parser.add_argument('-o', '--output', help='Output CSV file path (default: input_components.csv)')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.input_csv):
        print(f"Error: Input file '{args.input_csv}' not found.")
        return
    
    convert_to_component_arrays(args.input_csv, args.output)

if __name__ == '__main__':
    main() 
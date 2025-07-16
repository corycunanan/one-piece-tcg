def get_direct_text(tag):
    if tag:
        # Get all direct text nodes (not from children)
        texts = [t for t in tag.find_all(string=True, recursive=False) if t.strip()]
        return texts[0].strip() if texts else ''
    return ''

def get_power(card):
    power_tag = card.select_one('.power')
    if power_tag:
        return get_direct_text(power_tag)
    return ''

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
    'ST22': 'ST22 - Ace & Newgate',
    'ST23': 'ST23 - Monkey D. Luffy',
    'ST24': 'ST24 - Roronoa Zoro',
    'ST25': 'ST25 - Nami',
    'ST26': 'ST26 - Usopp',
    'ST27': 'ST27 - Sanji',
    'ST28': 'ST28 - Tony Tony Chopper',
    'P': 'Promotional Cards'
} 
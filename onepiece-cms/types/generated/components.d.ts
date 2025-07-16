import type { Schema, Struct } from '@strapi/strapi';

export interface CardsAttributes extends Struct.ComponentSchema {
  collectionName: 'components_cards_attributes';
  info: {
    displayName: 'attributes';
  };
  attributes: {
    attribute: Schema.Attribute.Enumeration<
      ['Slash', 'Strike', 'Wisdom', 'Ranged', 'Special']
    >;
  };
}

export interface CardsCardImage extends Struct.ComponentSchema {
  collectionName: 'components_cards_card_images';
  info: {
    description: '';
    displayName: 'card_image';
    icon: 'picture';
  };
  attributes: {
    artist: Schema.Attribute.String;
    image_url: Schema.Attribute.String & Schema.Attribute.Required;
    is_default: Schema.Attribute.Boolean;
    label: Schema.Attribute.Enumeration<
      [
        'Regular',
        'Alternate Art',
        'Manga Art',
        'Full Art',
        'Parallel Rare',
        'Special Art',
        'Promo',
      ]
    > &
      Schema.Attribute.Required;
  };
}

export interface CardsColor extends Struct.ComponentSchema {
  collectionName: 'components_cards_colors';
  info: {
    displayName: 'color';
  };
  attributes: {
    color: Schema.Attribute.Enumeration<
      ['Red', 'Blue', 'Green', 'Purple', 'Yellow', 'Black']
    >;
  };
}

export interface CardsEffectLogic extends Struct.ComponentSchema {
  collectionName: 'components_cards_effect_logics';
  info: {
    description: '';
    displayName: 'effect_logic';
  };
  attributes: {
    effect_data: Schema.Attribute.JSON;
  };
}

export interface CardsTrait extends Struct.ComponentSchema {
  collectionName: 'components_cards_traits';
  info: {
    description: '';
    displayName: 'trait';
  };
  attributes: {
    trait: Schema.Attribute.Enumeration<
      [
        'Accino Family',
        'Alabasta',
        'Alchemi',
        'Alvida Pirates',
        'Amazon Lily',
        'Animal',
        'Animal Kingdom Pirates',
        'Arlong Pirates',
        'Asuka Island',
        'Baroque Works',
        'Barto Club',
        'Beautiful Pirates',
        'Bellamy Pirates',
        'Big Mom Pirates',
        'Biological Weapon',
        'Black Cat Pirates',
        'Blackbeard Pirates',
        'Blackbeard Pirates Allies',
        'Bluejam Pirates',
        'Bonney Pirates',
        'Botanist',
        'Bowin Island',
        'Brownbeard Pirates',
        'Buggy Pirates',
        'CP0',
        'CP6',
        'CP7',
        'CP9',
        'Caribou Pirates',
        'Celestial Dragons',
        'Cross Guild',
        'Crown Island',
        'Donquixote Pirates',
        'Drake Pirates',
        'Dressrosa',
        'Drum Kingdom',
        'East Blue',
        'Egghead',
        'Eldoraggo Crew',
        'FILM',
        'Fake Straw Hat Crew',
        'Fallen Monk Pirates',
        'Firetank Pirates',
        'Fish-Man',
        'Fish-Man Island',
        'Flying Pirates',
        'Foolshout Island',
        'Former Arlong Pirates',
        'Former Baroque Works',
        'Former Big Mom Pirates',
        'Former CP9',
        'Former Navy',
        'Former Rocks Pirates',
        'Former Roger Pirates',
        'Former Rolling Pirates',
        'Former Rumbar Pirates',
        'Former Whitebeard Pirates',
        'Foxy Pirates',
        'Frost Moon Village',
        'GERMA 66',
        'Galley-La Company',
        'Gasparde Pirates',
        'Giant',
        'Goa Kingdom',
        'Golden Lion Pirates',
        'Grantesoro',
        'Gyro Pirates',
        'Happosui Army',
        'Hawkins Pirates',
        'Heart Pirates',
        'Homies',
        'Impel Down',
        'Jailer Beast',
        'Jaya',
        'Jellyfish Pirates',
        'Journalist',
        'Kid Pirates',
        'King of the Pirates',
        'Kingdom of GERMA',
        'Kingdom of Prodence',
        'Kouzuki Clan',
        'Krieg Pirates',
        'Kuja Pirates',
        'Kurozumi Clan',
        'Land of Wano',
        'Long Ring Long Land',
        'Lulucia Kingdom',
        'Lunarian',
        'Mary Geoise',
        'Mecha Island',
        'Merfolk',
        'Minks',
        'Monkey Mountain Alliance',
        'Mountain Bandits',
        'Muggy Kingdom',
        'Mugiwara Chase',
        'Music',
        'Navy',
        'Neo Navy',
        'Neptunian',
        'New Fish-Man Pirates',
        'New Giant Pirates',
        'ODYSSEY',
        'Ohara',
        'Omatsuri Island',
        'On-Air Pirates',
        'Peachbeard Pirates',
        'Plague',
        'Punk Hazard',
        'Red-Haired Pirates',
        'Revolutionary Army',
        'Roger Pirates',
        'Rumbar Pirates',
        'SMILE',
        'SWORD',
        'Scientist',
        'Seraphim',
        'Shandian Warrior',
        'Shipbuilding Town',
        'Sky Island',
        'Smile',
        'Sniper Island',
        'Spade Pirates',
        'Sprite',
        'Straw Hat Crew',
        'Supernovas',
        'The Akazaya Nine',
        'The Flying Fish Riders',
        'The Four Emperors',
        'The Franky Family',
        'The House of Lambs',
        'The Moon',
        'The Pirates Fest',
        'The Seven Warlords of the Sea',
        'The Sun Pirates',
        'The Tontattas',
        'The Vinsmoke Family',
        'Thriller Bark Pirates',
        'Treasure Pirates',
        'Trump Pirates',
        'Vassals',
        'Water Seven',
        'Whitebeard Pirates',
        'Whitebeard Pirates Allies',
        'Whole Cake Island',
        'Windmill Village',
        'World Government',
        'World Pirates',
        'Yonta Maria Fleet',
      ]
    > &
      Schema.Attribute.Required;
  };
}

export interface CardsTriggerEffect extends Struct.ComponentSchema {
  collectionName: 'components_cards_trigger_effects';
  info: {
    description: '';
    displayName: 'trigger_effect_logic';
  };
  attributes: {
    effect_data: Schema.Attribute.JSON;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'cards.attributes': CardsAttributes;
      'cards.card-image': CardsCardImage;
      'cards.color': CardsColor;
      'cards.effect-logic': CardsEffectLogic;
      'cards.trait': CardsTrait;
      'cards.trigger-effect': CardsTriggerEffect;
    }
  }
}

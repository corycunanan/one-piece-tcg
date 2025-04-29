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
    image_url: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    > &
      Schema.Attribute.Required;
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
    >;
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
        'Straw Hat Crew',
        'Supernovas',
        'Heart Pirates',
        'Animal Kingdom Pirates',
        'Big Mom Pirates',
        'Navy',
        'Warlord of the Sea',
        'Revolutionary Army',
        'Donquixote Pirates',
        'Worst Generation',
        'Fish-Man',
        'Germa 66',
        'Whitebeard Pirates',
        'Four Emperors',
        'Skypiea',
        'Thriller Bark Pirates',
        'CP9',
        'Impel Down',
        'Shandia',
        'Amazon Lily',
        'Dressrosa',
        'Drum Kingdom',
        'Mink Tribe',
        'Alabasta',
        'Punk Hazard',
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

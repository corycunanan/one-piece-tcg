import type { Schema, Struct } from '@strapi/strapi';

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
    action: Schema.Attribute.Enumeration<
      [
        'drawCard',
        'attachDon',
        'playFromTrash',
        'givePower',
        'reducePower',
        'donMinus',
        'searchDeck',
        'negateEffects',
      ]
    >;
    amount: Schema.Attribute.Integer;
    condition: Schema.Attribute.JSON;
    duration: Schema.Attribute.Enumeration<
      [
        'untilEndOfTurn',
        'untilEndOfOpponentTurn',
        'untilEndOfOpponentNextTurn',
        'permanent',
      ]
    >;
    filter: Schema.Attribute.JSON;
    optional: Schema.Attribute.Boolean;
    priority: Schema.Attribute.Integer;
    target: Schema.Attribute.String;
    timing: Schema.Attribute.Enumeration<['immediate', 'delayed', 'endOfTurn']>;
    trigger: Schema.Attribute.Enumeration<
      ['onPlay', 'onAttack', 'onKO', 'onBlock', 'manual', 'Activate:Main']
    >;
  };
}

export interface CardsTrait extends Struct.ComponentSchema {
  collectionName: 'components_cards_traits';
  info: {
    description: '';
    displayName: 'trait';
  };
  attributes: {
    trait_name: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'cards.color': CardsColor;
      'cards.effect-logic': CardsEffectLogic;
      'cards.trait': CardsTrait;
    }
  }
}

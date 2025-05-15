import { MockCard } from '../mockCards';

export class Deck {
  leader: MockCard;
  mainDeck: MockCard[]; // 40 character/event cards
  donDeck: MockCard[]; // 10 DON cards

  constructor(leader: MockCard, mainDeck: MockCard[], donDeck: MockCard[]) {
    if (mainDeck.length !== 40) throw new Error('Main deck must have 40 cards');
    if (donDeck.length !== 10) throw new Error('DON deck must have 10 cards');
    this.leader = leader;
    this.mainDeck = [...mainDeck];
    this.donDeck = [...donDeck];
  }

  shuffleMain() {
    this.mainDeck = Deck.shuffle(this.mainDeck);
  }

  shuffleDon() {
    this.donDeck = Deck.shuffle(this.donDeck);
  }

  draw(n = 1): MockCard[] {
    return this.mainDeck.splice(0, n);
  }

  drawDon(n = 1): MockCard[] {
    return this.donDeck.splice(0, n);
  }

  static shuffle(cards: MockCard[]): MockCard[] {
    const arr = [...cards];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
} 
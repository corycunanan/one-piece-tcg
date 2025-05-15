export interface MockCard {
  id: string;
  name: string;
  type: 'Leader' | 'Character' | 'Event' | 'Stage' | 'Don!!';
  cost?: number;
  power?: number;
  life?: number;
  image?: string;
  cardBack?: string;
}

export const mockCards: MockCard[] = [
  {
    id: '1',
    name: 'Monkey D. Luffy',
    type: 'Leader',
    cost: 5,
    power: 5000,
    life: 5,
    image: '/monkey-d-luffy-st21-001.png',
    cardBack: '/card-back.jpg',
  },
  {
    id: '2',
    name: 'Roronoa Zoro',
    type: 'Character',
    cost: 3,
    power: 4000,
    image: '/roronoa-zoro-op01-025sr.jpg',
    cardBack: '/card-back.jpg',
  },
  {
    id: '3',
    name: 'Gum-Gum Pistol',
    type: 'Event',
    cost: 2,
    image: '',
    cardBack: '/card-back.jpg',
  },
  {
    id: '4',
    name: 'Thousand Sunny',
    type: 'Stage',
    cost: 1,
    image: '',
    cardBack: '/card-back.jpg',
  },
  {
    id: '5',
    name: 'Don!!',
    type: 'Don!!',
    image: '',
    cardBack: '/card-back.jpg',
  },
]; 
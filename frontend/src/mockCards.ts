export interface MockCard {
  id: string;
  name: string;
  type: 'Leader' | 'Character' | 'Event' | 'Stage' | 'Don!!';
  cost?: number;
  power?: number;
  life?: number;
  image?: string;
}

export const mockCards: MockCard[] = [
  {
    id: '1',
    name: 'Monkey D. Luffy',
    type: 'Leader',
    cost: 5,
    power: 5000,
    life: 5,
    image: '',
  },
  {
    id: '2',
    name: 'Roronoa Zoro',
    type: 'Character',
    cost: 3,
    power: 4000,
    image: '',
  },
  {
    id: '3',
    name: 'Gum-Gum Pistol',
    type: 'Event',
    cost: 2,
    image: '',
  },
  {
    id: '4',
    name: 'Thousand Sunny',
    type: 'Stage',
    cost: 1,
    image: '',
  },
  {
    id: '5',
    name: 'Don!!',
    type: 'Don!!',
    image: '',
  },
]; 
export interface Boardgame {
  _id?: string;
  id?: string;
  name: string;
  image: string;
  players: string;
  playtime: number;
  age: string;
  description: string;
}

export function formatImageUrl(game: Boardgame): Boardgame {
  return {
    ...game,
    image: game.image.startsWith('http') ? game.image : `http://localhost:3000${game.image}`
  };
}

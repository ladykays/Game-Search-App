export const exclude18Plus = (games) => {
  return games.filter((game) => {
    const rating = game.esrb_rating?.name;
    return rating !== "Adults Only" && rating !== "Mature";
    
  });
}
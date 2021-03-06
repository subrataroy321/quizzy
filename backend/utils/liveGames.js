class LiveGames {
  constructor() {
    this.games = []
  }
  // add a game with hostId and game Data
  addGame(pin, hostId, gameLive, gameData) {
    let game = { pin, hostId, gameLive, gameData }
    this.games.push(game)
    return game
  }

  // remove a game using host id
  removeGame(hostId) {
    let game = this.getGame(hostId)

    if (game) {
      this.games = this.games.filter((game) => game.hostId !== hostId)
    }
    return game
  }

  // get a game using host id
  getGame(hostId) {
    let game = this.games.filter((game) => game.hostId === hostId)
    return game[0]
  }
}

module.exports = { LiveGames }

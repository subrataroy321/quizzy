class Players {
  constructor() {
    this.players = []
  }

  addPlayer(hostId, playerId, name, gameData) {
    let player = { hostId, playerId, name, gameData }
    this.players.push(player)
    return player
  }

  removePlayer(playerId) {
    let player = this.getPlayer(playerId)

    if (player) {
      this.players = this.players.filter(
        (player) => player.playerId !== playerId
      )
    }
    return player
  }

  getPlayer(playerId) {
    let player = this.players.filter((player) => player.playerId === playerId)
    return player[0]
  }

  getPlayers(hostId) {
    let player = this.players.filter((player) => player.hostId === hostId)
    return player
  }
}

module.exports = { Players }

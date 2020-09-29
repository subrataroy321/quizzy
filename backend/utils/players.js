class Players {
  constructor() {
    this.players = []
  }

  addPlayer(hostId, playerId, name, gameData) {
    var player = { hostId, playerId, name, gameData }
    this.players.push(player)
    return player
  }

  removePlayer(playerId) {
    var player = this.getPlayer(playerId)

    if (player) {
      this.players = this.players.filter(
        (player) => player.playerId !== playerId
      )
    }
    return player
  }

  getPlayer(playerId) {
    var player = this.players.filter((player) => player.playerId === playerId)
    return player[0]
  }

  getPlayers(hostId) {
    var player = this.players.filter((player) => player.hostId === hostId)
    return player
  }
}

module.exports = { Players }

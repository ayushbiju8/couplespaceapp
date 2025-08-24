import React, { useEffect, useState } from 'react'
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'

const { width, height } = Dimensions.get('window')

const CANDY_EMOJIS = [
  '🍬', '🍭', '🍡', '🍩', '🍫', '🍥', '🍧', '🍨', '🍓', '⭐',
  '🍪', '🧁', '🍦', '🍯', '🍎', '🍉', '🍒', '🍊', '🍋', '🍌',
  '🍈', '🍇', '🍑', '🍍', '🥝', '🍔', '🍕', '🍟', '🍿', '🥨',
]
const CANDY_SIZE = 60
const TOP_RESERVED = 100
const NUM_CANDIES = 14

function getRandomPositions(num: number) {
  const positions: { x: number; y: number }[] = []
  for (let i = 0; i < num; i++) {
    const x = Math.random() * (width - CANDY_SIZE)
    const y = TOP_RESERVED + Math.random() * (height - TOP_RESERVED - CANDY_SIZE - 40)
    positions.push({ x, y })
  }
  return positions
}

type PlayerNames = { player1: string; player2: string }
type GameStats = { player1Wins: number; player2Wins: number }
type PoisonCandies = { player1: number | null; player2: number | null }
type GamePhase = 'setup' | 'choosing-poison' | 'playing' | 'game-over'
type Candy = { id: number; emoji: string }

const PoisonCandyGame = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup')
  const [currentPlayer, setCurrentPlayer] = useState<number>(1)
  const [playerNames, setPlayerNames] = useState<PlayerNames>({ player1: '', player2: '' })
  const [poisonCandies, setPoisonCandies] = useState<PoisonCandies>({ player1: null, player2: null })
  const [poisonChoosingPlayer, setPoisonChoosingPlayer] = useState<1 | 2>(1)
  const [selectedCandies, setSelectedCandies] = useState<number[]>([])
  const [winner, setWinner] = useState<number | null>(null)
  const [gameStats, setGameStats] = useState<GameStats>({ player1Wins: 0, player2Wins: 0 })
  const [candies, setCandies] = useState<Candy[]>([])
  const [candyPositions, setCandyPositions] = useState<{ x: number; y: number }[]>([])

  useEffect(() => {
    const shuffled = [...CANDY_EMOJIS].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, NUM_CANDIES).map((emoji, idx) => ({ id: idx + 1, emoji }))
    setCandies(selected)
    setCandyPositions(getRandomPositions(NUM_CANDIES))
  }, [gamePhase])

  const handleNameChange = (player: keyof PlayerNames, name: string) => {
    setPlayerNames(prev => ({ ...prev, [player]: name }))
  }

  const startGame = () => {
    if (playerNames.player1.trim() && playerNames.player2.trim()) {
      setGamePhase('choosing-poison')
      setPoisonChoosingPlayer(1)
      setPoisonCandies({ player1: null, player2: null })
    } else {
      Alert.alert('Missing Names', 'Please enter both player names!')
    }
  }

  // Both players choose poison, one after the other
  const choosePoisonCandy = (candyId: number) => {
    if (poisonChoosingPlayer === 1) {
      setPoisonCandies(prev => ({ ...prev, player1: candyId }))
      setTimeout(() => {
        setPoisonChoosingPlayer(2)
      }, 500)
    } else {
      setPoisonCandies(prev => ({ ...prev, player2: candyId }))
      setTimeout(() => {
        setGamePhase('playing')
        setCurrentPlayer(Math.random() > 0.5 ? 1 : 2)
      }, 500)
    }
  }

  const selectCandy = (candyId: number) => {
    if (selectedCandies.includes(candyId)) return
    setSelectedCandies(prev => [...prev, candyId])
    // If player picks either poison, the other player wins
    if (candyId === poisonCandies.player1 || candyId === poisonCandies.player2) {
      const winningPlayer = currentPlayer === 1 ? 2 : 1
      setWinner(winningPlayer)
      setGameStats(prev => ({
        ...prev,
        [`player${winningPlayer}Wins` as keyof GameStats]: prev[`player${winningPlayer}Wins` as keyof GameStats] + 1
      }))
      setTimeout(() => {
        setGamePhase('game-over')
      }, 1500)
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
    }
  }

  const resetGame = () => {
    setGamePhase('choosing-poison')
    setPoisonCandies({ player1: null, player2: null })
    setPoisonChoosingPlayer(1)
    setSelectedCandies([])
    setWinner(null)
    setCurrentPlayer(Math.random() > 0.5 ? 1 : 2)
  }

  const newGame = () => {
    setGamePhase('setup')
    setPlayerNames({ player1: '', player2: '' })
    setPoisonCandies({ player1: null, player2: null })
    setPoisonChoosingPlayer(1)
    setSelectedCandies([])
    setWinner(null)
    setCurrentPlayer(1)
    setGameStats({ player1Wins: 0, player2Wins: 0 })
  }

  const renderCandy = (
    candy: Candy,
    onPress: () => void,
    isSelected: boolean = false
  ) => {
    const pos = candyPositions[candy.id - 1] || { x: 0, y: 0 }
    return (
      <TouchableOpacity
        key={candy.id}
        style={[
          styles.candy,
          {
            position: 'absolute',
            left: pos.x,
            top: pos.y,
            backgroundColor: isSelected ? '#e0e0e0' : '#ffb6d5',
            opacity: isSelected ? 0.7 : 1,
            zIndex: isSelected ? 2 : 1,
          },
        ]}
        onPress={onPress}
        disabled={isSelected}
        activeOpacity={0.8}
      >
        <Text style={styles.candyEmoji}>{candy.emoji}</Text>
        {isSelected && <Text style={styles.checkMark}>✅</Text>}
      </TouchableOpacity>
    )
  }

  const renderSetupScreen = () => (
    <View style={styles.setupContainer}>
      <View style={styles.card}>
        <Text style={styles.title}>💀 Poison Candy Game 💀</Text>
        <Text style={styles.subtitle}>A thrilling game for couples!</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Player 1 Name</Text>
          <TextInput
            style={styles.input}
            value={playerNames.player1}
            onChangeText={(text) => handleNameChange('player1', text)}
            placeholder="Enter your name..."
            placeholderTextColor="#999"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Player 2 Name</Text>
          <TextInput
            style={styles.input}
            value={playerNames.player2}
            onChangeText={(text) => handleNameChange('player2', text)}
            placeholder="Enter your name..."
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={startGame}>
          <Text style={styles.buttonText}>Start Game 🎮</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderPoisonChoiceScreen = () => (
    <View style={styles.container}>
      <View style={styles.topArea}>
        <Text style={styles.title}>
          🕵️ {playerNames[`player${poisonChoosingPlayer}` as 'player1' | 'player2']}'s Secret Turn 🕵️
        </Text>
        <Text style={styles.subtitle}>Choose your poison candy secretly!</Text>
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>⚠️ The other player should look away! ⚠️</Text>
        </View>
      </View>
      <View style={styles.scatterArea}>
        {candies.map(candy =>
          renderCandy(
            candy,
            () => choosePoisonCandy(candy.id),
            poisonCandies[`player${poisonChoosingPlayer}` as 'player1' | 'player2'] === candy.id
          )
        )}
      </View>
    </View>
  )

  const renderGameScreen = () => (
    <View style={styles.container}>
      <View style={styles.topArea}>
        <Text style={styles.title}>
          🎯 {playerNames[`player${currentPlayer}` as 'player1' | 'player2']}'s Turn 🎯
        </Text>
        <Text style={styles.subtitle}>Choose a candy... but beware of the poison!</Text>
        <View style={styles.scoreContainer}>
          <View style={styles.scoreBox}>
            <Text style={styles.playerName}>{playerNames.player1}</Text>
            <Text style={styles.scoreText}>Wins: {gameStats.player1Wins}</Text>
          </View>
          <Text style={styles.vs}>⚡</Text>
          <View style={styles.scoreBox}>
            <Text style={styles.playerName}>{playerNames.player2}</Text>
            <Text style={styles.scoreText}>Wins: {gameStats.player2Wins}</Text>
          </View>
        </View>
      </View>
      <View style={styles.scatterArea}>
        {candies.map(candy =>
          renderCandy(
            candy,
            () => selectCandy(candy.id),
            selectedCandies.includes(candy.id)
          )
        )}
      </View>
    </View>
  )

  const renderGameOverScreen = () => (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.gameOverEmoji}>💀</Text>
        <Text style={styles.gameOverTitle}>Game Over!</Text>
        <View style={styles.winnerContainer}>
          <Text style={styles.winnerText}>
            🎉 {winner !== null ? playerNames[`player${winner}` as keyof PlayerNames] : ''} Wins! 🎉
          </Text>
          <Text style={styles.winnerSubtext}>
            {winner !== null ? playerNames[`player${winner === 1 ? 2 : 1}` as keyof PlayerNames] : ''} chose the poison candy!
          </Text>
        </View>
        <View style={styles.finalScoreContainer}>
          <Text style={styles.finalScoreTitle}>Final Score</Text>
          <Text style={styles.finalScoreText}>
            {playerNames.player1}: {gameStats.player1Wins} wins
          </Text>
          <Text style={styles.finalScoreText}>
            {playerNames.player2}: {gameStats.player2Wins} wins
          </Text>
        </View>
        <TouchableOpacity style={styles.playAgainButton} onPress={resetGame}>
          <Text style={styles.buttonText}>Play Again 🔄</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.newGameButton} onPress={newGame}>
          <Text style={styles.buttonText}>New Game 🆕</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.mainContainer}>
      {gamePhase === 'setup' && renderSetupScreen()}
      {gamePhase === 'choosing-poison' && renderPoisonChoiceScreen()}
      {gamePhase === 'playing' && renderGameScreen()}
      {gamePhase === 'game-over' && renderGameOverScreen()}
    </View>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  setupContainer: {
    flex: 1,
    backgroundColor: '#ffe4ec',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffe4ec',
    padding: 0,
  },
  topArea: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 4,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  scatterArea: {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  candy: {
    width: CANDY_SIZE,
    height: CANDY_SIZE,
    borderRadius: CANDY_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  candyEmoji: {
    fontSize: 36,
  },
  checkMark: {
    fontSize: 20,
    marginTop: 2,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff69b4',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#ffb6d5',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#ff69b4',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  warningBox: {
    backgroundColor: '#ffebee',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ffcdd2',
  },
  warningText: {
    color: '#d32f2f',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  scoreBox: {
    alignItems: 'center',
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff69b4',
  },
  scoreText: {
    fontSize: 14,
    color: '#666',
  },
  vs: {
    fontSize: 30,
    marginHorizontal: 20,
  },
  gameOverEmoji: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 20,
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  winnerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  winnerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4caf50',
    textAlign: 'center',
    marginBottom: 10,
  },
  winnerSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  finalScoreContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  finalScoreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  finalScoreText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
  playAgainButton: {
    backgroundColor: '#4caf50',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  newGameButton: {
    backgroundColor: '#757575',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
})

export default PoisonCandyGame
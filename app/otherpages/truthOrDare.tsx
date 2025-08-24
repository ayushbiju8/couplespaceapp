import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const truthOrDare = () => {
  const [currentMode, setCurrentMode] = useState(''); // 'truth' or 'dare'
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [players, setPlayers] = useState(['Player 1', 'Player 2']);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  
  // Animation values
  const pulseValue = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;
  const cardSlide = useRef(new Animated.Value(0)).current;
  const playerGlow = useRef(new Animated.Value(0)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  
  // Particle animations
  const particles = useRef([...Array(6)].map(() => ({
    x: useRef(new Animated.Value(0)).current,
    y: useRef(new Animated.Value(0)).current,
    opacity: useRef(new Animated.Value(0)).current,
    scale: useRef(new Animated.Value(0)).current,
  }))).current;

  const truthQuestions = [
    "What's the most embarrassing thing that's ever happened to you?",
    "What's your biggest fear?",
    "What's the weirdest dream you've ever had?",
    "What's your most unusual talent?",
    "Whats your ideal type?",
    "What's your biggest regret?",
    "What's the most childish thing you still do?",
    "What's your guilty pleasure?",
    "What's the most trouble you've ever gotten into?",
    "What's your weirdest habit?",
    "What's the strangest thing you believed as a child?",
    "Can you imagine building a family with me ? If yes how does it look like at first glance",
    "When was the first time you want to kiss her/him",
    "First impression of me",
    " You are most grateful about?",
    "When do you feel loved or seen the most?",
    "one thing you loved but never told",
  ];

  const dareQuestions = [
    "Do 20 push-ups right now!",
    "Sing your favorite song out loud!",
    "Dance for 30 seconds without music!",
    "imitate me for next 1 minute!",
    "Speak in an accent for the next 3 rounds!",
    "Do a handstand for 10 seconds!",
    "Tell a joke and make me laugh!",
    "Do your best animal impression!",
    "Eat something spicy!",
    "Do 50 jumping jacks!",
    "Wear your clothes backwards until your next turn!",
    "Do your best robot dance!",
    "make me laugh for next 1 minute!",
    "Do a cartwheel or attempt one!",
    "Pretend to be a news reporter and give a silly news report!",
  ];

  // Continuous floating animation
  useEffect(() => {
    const startFloating = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatingAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(floatingAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    startFloating();
  }, []);

  const selectPlayerWithAnimation = () => {
    if (isSelecting || players.length < 2) return;
    
    setIsSelecting(true);
    setSelectedPlayer('');
    setCurrentQuestion('');
    setCurrentMode('');
    
    // Reset animations
    fadeValue.setValue(0);
    playerGlow.setValue(0);
    scaleAnim.setValue(0);
    
    // Start particle explosion
    triggerParticles();
    
    // Pulsing animation for player selection
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.3,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    );
    
    pulseAnimation.start();
    
    // Simulate selection process
    let currentIndex = 0;
    const selectionInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % players.length;
    }, 150);
    
    setTimeout(() => {
      clearInterval(selectionInterval);
      pulseAnimation.stop();
      
      // Final selection
      const randomIndex = Math.floor(Math.random() * players.length);
      setSelectedPlayer(players[randomIndex]);
      
      // Glow animation for selected player
      Animated.sequence([
        Animated.timing(playerGlow, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeValue, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
      
      setIsSelecting(false);
    }, 2000);
  };

  const triggerParticles = () => {
    particles.forEach((particle, index) => {
      // Random positions
      const randomX = (Math.random() - 0.5) * 200;
      const randomY = (Math.random() - 0.5) * 200;
      
      particle.x.setValue(0);
      particle.y.setValue(0);
      particle.opacity.setValue(0);
      particle.scale.setValue(0);
      
      Animated.parallel([
        Animated.timing(particle.x, {
          toValue: randomX,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(particle.y, {
          toValue: randomY,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(particle.opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(particle.scale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(particle.scale, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });
  };

  const selectTruthOrDare = (mode: string) => {
    if (!selectedPlayer) return;
    
    setCurrentMode(mode);
    setCurrentQuestion('');
    
    // Button pulse animation
    Animated.sequence([
      Animated.timing(buttonPulse, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(buttonPulse, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
    
    // Card slide animation
    Animated.timing(cardSlide, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const getRandomQuestion = () => {
    if (!currentMode) return;
    
    const questions = currentMode === 'truth' ? truthQuestions : dareQuestions;
    const randomIndex = Math.floor(Math.random() * questions.length);
    setCurrentQuestion(questions[randomIndex]);
    
    // Question reveal animation
    cardSlide.setValue(0);
    Animated.spring(cardSlide, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const addPlayer = () => {
    if (newPlayerName.trim() && !players.includes(newPlayerName.trim())) {
      setPlayers([...players, newPlayerName.trim()]);
      setNewPlayerName('');
      setShowAddPlayer(false);
    }
  };

  const removePlayer = (playerToRemove: string) => {
    if (players.length > 2) {
      setPlayers(players.filter(player => player !== playerToRemove));
      if (selectedPlayer === playerToRemove) {
        setSelectedPlayer('');
        setCurrentMode('');
        setCurrentQuestion('');
      }
    }
  };

  const resetGame = () => {
    setCurrentMode('');
    setCurrentQuestion('');
    setSelectedPlayer('');
    setIsSelecting(false);
    fadeValue.setValue(0);
    pulseValue.setValue(1);
    buttonPulse.setValue(1);
    cardSlide.setValue(0);
    playerGlow.setValue(0);
    scaleAnim.setValue(0);
  };

  const floatingY = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const glowOpacity = playerGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.titleContainer, { transform: [{ translateY: floatingY }] }]}>
        <Text style={styles.title}>Truth or Dare</Text>
        <View style={styles.titleAccent} />
      </Animated.View>
      
      {/* Particles */}
      <View style={styles.particlesContainer}>
        {particles.map((particle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                opacity: particle.opacity,
                transform: [
                  { translateX: particle.x },
                  { translateY: particle.y },
                  { scale: particle.scale },
                ],
              },
            ]}
          />
        ))}
      </View>
      
      {/* Player Management */}
      {/* Removed player management UI as requested */}

      {/* Animated Player Selection */}
      {/* Removed animated player selection circle as requested */}

      {/* Select Button */}
      <TouchableOpacity
        style={[styles.selectButton, isSelecting && styles.selectButtonDisabled]}
        onPress={selectPlayerWithAnimation}
        disabled={isSelecting}
      >
        <Text style={styles.selectButtonText}>
          {isSelecting ? 'Selecting Player...' : 'SELECT RANDOM PLAYER'}
        </Text>
      </TouchableOpacity>

      {/* Selected Player Display */}
      {selectedPlayer && (
        <Animated.View 
          style={[
            styles.selectedPlayerContainer,
            {
              opacity: fadeValue,
            }
          ]}
        >
          <Text style={styles.selectedPlayerText}>
            {selectedPlayer}'s Turn! 🎯
          </Text>
          
          {/* Truth or Dare Selection */}
          <View style={styles.choiceContainer}>
            <Animated.View style={{ transform: [{ scale: currentMode === 'truth' ? buttonPulse : 1 }] }}>
              <TouchableOpacity
                style={[styles.choiceButton, styles.truthButton]}
                onPress={() => selectTruthOrDare('truth')}
              >
                <Text style={styles.choiceButtonText}>TRUTH</Text>
                <Text style={styles.choiceEmoji}>🤔</Text>
              </TouchableOpacity>
            </Animated.View>
            
            <Animated.View style={{ transform: [{ scale: currentMode === 'dare' ? buttonPulse : 1 }] }}>
              <TouchableOpacity
                style={[styles.choiceButton, styles.dareButton]}
                onPress={() => selectTruthOrDare('dare')}
              >
                <Text style={styles.choiceButtonText}>DARE</Text>
                <Text style={styles.choiceEmoji}>🚀</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      )}

      {/* Question Display */}
      {currentMode && (
        <Animated.View 
          style={[
            styles.questionSection,
            {
              transform: [{ translateY: cardSlide.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }) }],
              opacity: cardSlide,
            }
          ]}
        >
          <View style={styles.questionCard}>
            <Text style={[
              styles.modeTitle,
              currentMode === 'truth' ? styles.truthColor : styles.dareColor
            ]}>
              {currentMode.toUpperCase()} for {selectedPlayer}
            </Text>
            
            <TouchableOpacity
              style={[
                styles.questionButton,
                currentMode === 'truth' ? styles.truthButtonStyle : styles.dareButtonStyle
              ]}
              onPress={getRandomQuestion}
            >
              <Text style={styles.questionButtonText}>
                {currentQuestion ? '🔄 Get New Question' : '🎲 Get Question'}
              </Text>
            </TouchableOpacity>
            
            {currentQuestion && (
              <Animated.View 
                style={[
                  styles.questionContainer,
                  {
                    transform: [{ scale: cardSlide }],
                  }
                ]}
              >
                <Text style={styles.questionText}>{currentQuestion}</Text>
              </Animated.View>
            )}
          </View>
        </Animated.View>
      )}

      {/* Reset Button */}
      <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
        <Text style={styles.resetButtonText}>🔄 Reset Game</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    paddingTop: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: '#e91e63',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  titleAccent: {
    width: 100,
    height: 3,
    backgroundColor: '#e91e63',
    borderRadius: 2,
    marginTop: 5,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e91e63',
    top: '50%',
    left: '50%',
  },
  playersSection: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  playersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  playerTag: {
    backgroundColor: '#e91e63',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 3,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  playerGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 25,
    backgroundColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
  },
  playerName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedPlayerName: {
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  removeButton: {
    marginLeft: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addPlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    padding: 12,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#666',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addPlayerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  addPlayerButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  selectorContainer: {
    marginBottom: 20,
  },
  selectorCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(233, 30, 99, 0.2)',
    borderWidth: 2,
    borderColor: '#e91e63',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#e91e63',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  selectorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  selectButton: {
    backgroundColor: '#e91e63',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#e91e63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  selectButtonDisabled: {
    backgroundColor: '#666',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  selectedPlayerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedPlayerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textShadowColor: '#e91e63',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  choiceContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  choiceButton: {
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  truthButton: {
    backgroundColor: '#4CAF50',
  },
  dareButton: {
    backgroundColor: '#f44336',
  },
  choiceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  choiceEmoji: {
    fontSize: 20,
    marginTop: 5,
  },
  questionSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  questionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  truthColor: {
    color: '#4CAF50',
  },
  dareColor: {
    color: '#f44336',
  },
  questionButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 15,
  },
  truthButtonStyle: {
    backgroundColor: '#4CAF50',
  },
  dareButtonStyle: {
    backgroundColor: '#f44336',
  },
  questionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  questionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginTop: 10,
    maxWidth: width - 80,
  },
  questionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  resetButton: {
    backgroundColor: '#666',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 10,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default truthOrDare;
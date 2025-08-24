import React, { useState } from 'react'
import { Animated, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const { width: screenWidth } = Dimensions.get('window')

const coupleQuestions = [
  "What's your partner's biggest fear?",
  "Where did your partner want to travel most?",
  "What's your partner's favorite childhood memory?",
  "What would your partner do with a million dollars?",
  "What's your partner's secret talent?",
  "What's your partner's biggest pet peeve?",
  "What's your partner's dream job?",
  "What's your partner's favorite way to relax?",
  "What makes your partner laugh the most?",
  "What's your partner's biggest accomplishment?"
]

const CoupleQuiz = () => {
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [answeredCards, setAnsweredCards] = useState(new Set())
  const [modalVisible, setModalVisible] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [cardAnimations] = useState(
    [...Array(10)].map(() => new Animated.Value(1))
  )

  const handleCardPress = (index: number) => {
    if (answeredCards.has(index)) return

    setSelectedCard(index)
    setCurrentQuestion(coupleQuestions[index])
    setModalVisible(true)

    // Animate card selection
    Animated.sequence([
      Animated.timing(cardAnimations[index], {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnimations[index], {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handleAnswerComplete = () => {
    if (selectedCard !== null) {
      setAnsweredCards(prev => new Set([...prev, selectedCard]))
      
      // Animate answered card
      Animated.timing(cardAnimations[selectedCard], {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
    
    setModalVisible(false)
    setSelectedCard(null)
  }

  const resetGame = () => {
    setAnsweredCards(new Set())
    setSelectedCard(null)
    setModalVisible(false)
    
    // Reset all animations
    cardAnimations.forEach(anim => {
      anim.setValue(1)
    })
  }

  const getCardStyle = (index: number) => {
    const isAnswered = answeredCards.has(index)
    const isSelected = selectedCard === index
    
    return {
      ...styles.card,
      backgroundColor: isAnswered ? '#4CAF50' : isSelected ? '#ff1493' : '#ffe4ec',
      transform: [{ scale: cardAnimations[index] }],
    }
  }

  const getCardTextStyle = (index: number) => {
    const isAnswered = answeredCards.has(index)
    
    return {
      ...styles.cardText,
      color: isAnswered ? '#fff' : '#ff69b4',
    }
  }

  const completedQuestions = answeredCards.size

  return (
    <View style={styles.container}>
      <View style={styles.taskBar}>
        <Text style={styles.taskBarText}>💕 Couple Quiz 💕</Text>
        <Text style={styles.progressText}>
          {completedQuestions}/10 Questions Completed
        </Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            Tap a card to reveal a question about your partner! 
          </Text>
          <Text style={styles.subInstructionText}>
            See how well you know each other! 💖
          </Text>
        </View>

        <View style={styles.cardsGrid}>
          {[...Array(10)].map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => handleCardPress(i)}
              activeOpacity={0.8}
              disabled={answeredCards.has(i)}
            >
              <Animated.View style={getCardStyle(i)}>
                <Text style={getCardTextStyle(i)}>
                  {answeredCards.has(i) ? '✓' : i + 1}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>

        {completedQuestions === 10 && (
          <View style={styles.completionContainer}>
            <Text style={styles.completionText}>
              🎉 Congratulations! You've completed all questions! 🎉
            </Text>
            <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
              <Text style={styles.resetButtonText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(completedQuestions / 10) * 100}%` }
            ]} 
          />
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Question {selectedCard !== null ? selectedCard + 1 : ''}</Text>
              <Text style={styles.heartIcon}>💝</Text>
            </View>
            
            <Text style={styles.questionText}>{currentQuestion}</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.answerButton} 
                onPress={handleAnswerComplete}
              >
                <Text style={styles.answerButtonText}>I've Answered! ✨</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.skipButton} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.skipButtonText}>Skip for Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  taskBar: {
    width: '100%',
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#ff69b4',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  taskBarText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 5,
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  instructionContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 5,
  },
  subInstructionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    width: 280,
    marginBottom: 30,
  },
  card: {
    width: 70,
    height: 70,
    backgroundColor: '#ffe4ec',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
    elevation: 3,
    shadowColor: '#ff69b4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cardText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff69b4',
  },
  completionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  completionText: {
    fontSize: 18,
    color: '#4CAF50',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  resetButton: {
    backgroundColor: '#ff69b4',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    margin: 20,
    width: screenWidth - 40,
    maxWidth: 350,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ff69b4',
  },
  heartIcon: {
    fontSize: 24,
  },
  questionText: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 28,
    fontWeight: '500',
  },
  modalButtons: {
    gap: 12,
  },
  answerButton: {
    backgroundColor: '#ff69b4',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 2,
  },
  answerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
})

export default CoupleQuiz
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React, { useRef } from 'react'
import { Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const { width } = Dimensions.get('window')
const CARD_WIDTH = 290
const CARD_HEIGHT = 650
const SPACING = 32
const VISIBLE_ITEMS = 3

const gamesList = [
  {
    key: 'truth',
    image: require('../../assets/images/truth.jpg'),
    title: 'Truth or Dare',
    subtitle: 'Classic party game',
    route: '/otherpages/truthOrDare',
  },
  {
    key: 'poison',
    image: require('../../assets/images/poison.jpg'),
    title: 'Poison Challenge',
    subtitle: 'Test your limits',
    route: '/otherpages/otherGame',
  },
  {
    key: 'quiz',
    image: require('../../assets/images/quiz.jpg'),
    title: 'Quiz Master',
    subtitle: 'Brain teaser time',
    route: '/otherpages/coupleQuiz',
  },
]

const Games = () => {
  const scrollX = useRef(new Animated.Value(0)).current
  const headerScale = useRef(new Animated.Value(0)).current
  const headerOpacity = useRef(new Animated.Value(0)).current
  const router = useRouter()

  React.useEffect(() => {
    // Animate header on mount
    Animated.parallel([
      Animated.spring(headerScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <View style={styles.container}>
      {/* Enhanced Header with Gradient */}
      <LinearGradient
        colors={['#ff69b4', '#ff1493', '#c71585']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              transform: [{ scale: headerScale }],
              opacity: headerOpacity,
            }
          ]}
        >
          <Text style={styles.headerTitle}>🎮 GAME HUB</Text>
          <Text style={styles.headerSubtitle}>Choose your adventure</Text>
          <View style={styles.headerDecorator} />
        </Animated.View>
      </LinearGradient>

      {/* Enhanced Cards Carousel */}
      <View style={styles.carouselContainer}>
        <Animated.FlatList
          data={gamesList}
          keyExtractor={item => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flatListContainer}
          snapToInterval={CARD_WIDTH + SPACING}
          decelerationRate={0}
          bounces={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          renderItem={({ item, index }) => {
            const inputRange = [
              (index - 1) * (CARD_WIDTH + SPACING),
              index * (CARD_WIDTH + SPACING),
              (index + 1) * (CARD_WIDTH + SPACING),
            ]
            
            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.82, 1, 0.82],
              extrapolate: 'clamp',
            })
            
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.6, 1, 0.6],
              extrapolate: 'clamp',
            })
            
            const rotateY = scrollX.interpolate({
              inputRange,
              outputRange: ['15deg', '0deg', '-15deg'],
              extrapolate: 'clamp',
            })
            
            const translateY = scrollX.interpolate({
              inputRange,
              outputRange: [20, 0, 20],
              extrapolate: 'clamp',
            })

            return (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push(item.route as any)}
                style={{ width: CARD_WIDTH, height: CARD_HEIGHT, marginRight: SPACING }}
              >
              <Animated.View
                style={[
                  styles.card,
                  {
                    transform: [
                      { scale },
                      { rotateY },
                      { translateY }
                    ],
                    opacity,
                  }
                ]}
              >
                <View style={styles.cardImageContainer}>
                  <Image
                    source={item.image}
                    style={styles.cardImage}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.cardOverlay}
                  >
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                    </View>
                  </LinearGradient>
                </View>
                {/* Card border glow effect */}
                <View style={styles.cardGlow} />
              </Animated.View>
              </TouchableOpacity>
            )
          }}
        />
      </View>

      {/* Scroll Indicator */}
      <View style={styles.scrollIndicator}>
        {gamesList.map((_, index) => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH + SPACING),
            index * (CARD_WIDTH + SPACING),
            (index + 1) * (CARD_WIDTH + SPACING),
          ]
          
          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          })
          
          const dotScale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.2, 0.8],
            extrapolate: 'clamp',
          })

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  opacity: dotOpacity,
                  transform: [{ scale: dotScale }],
                }
              ]}
            />
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf0f5',
  },
  headerGradient: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#ff69b4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '300',
    letterSpacing: 1,
    opacity: 0.9,
  },
  headerDecorator: {
    width: 60,
    height: 4,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    marginTop: 15,
    opacity: 0.8,
  },
  carouselContainer: {
    flex: 1,
    paddingTop: 30,
  },
  flatListContainer: {
    paddingLeft: 24,
    paddingBottom: 12,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginRight: SPACING,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
  },
  cardImageContainer: {
    flex: 1,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    justifyContent: 'flex-end',
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    fontWeight: '300',
  },
  cardGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 26,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 105, 180, 0.3)',
    zIndex: -1,
  },
  scrollIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
    paddingTop: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff69b4',
    marginHorizontal: 6,
  },
})

export default Games
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, ImageBackground, Text, TouchableOpacity, View } from "react-native";

const { width, height } = Dimensions.get('window');

const AnimatedCuteBears = () => {
  const heartAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const wiggleAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Heart floating animation
    const heartAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(heartAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Bounce animation
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    // Wiggle animation
    const wiggleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(wiggleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(wiggleAnim, {
          toValue: -1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(wiggleAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    // Sparkle animation
    const sparkleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    heartAnimation.start();
    bounceAnimation.start();
    wiggleAnimation.start();
    sparkleAnimation.start();

    return () => {
      heartAnimation.stop();
      bounceAnimation.stop();
      wiggleAnimation.stop();
      sparkleAnimation.stop();
    };
  }, []);

  const heartTranslateY = heartAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const heartOpacity = heartAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.3, 0],
  });

  const bounceTranslateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const wiggleRotate = wiggleAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-3deg', '0deg', '3deg'],
  });

  const sparkleScale = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* Background gradient circle */}
      <View
        style={{
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: '#ffe4e1',
          opacity: 0.6,
        }}
      />

      {/* Animated sparkles around */}
      <Animated.View
        style={{
          position: 'absolute',
          top: -20,
          left: -30,
          transform: [{ scale: sparkleScale }],
        }}
      >
        <Text style={{ fontSize: 16, color: '#ffd700' }}>✨</Text>
      </Animated.View>

      <Animated.View
        style={{
          position: 'absolute',
          top: -10,
          right: -40,
          transform: [{ scale: sparkleScale }],
        }}
      >
        <Text style={{ fontSize: 20, color: '#ffd700' }}>⭐</Text>
      </Animated.View>

      <Animated.View
        style={{
          position: 'absolute',
          bottom: -20,
          left: -20,
          transform: [{ scale: sparkleScale }],
        }}
      >
        <Text style={{ fontSize: 18, color: '#ffd700' }}>✨</Text>
      </Animated.View>

      {/* Cute Bear Couple */}
      <Animated.View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          transform: [{ translateY: bounceTranslateY }],
        }}
      >
        {/* Male Bear */}
        <Animated.View
          style={{
            alignItems: 'center',
            marginRight: 10,
            transform: [{ rotate: wiggleRotate }],
          }}
        >
          {/* Bear face */}
          <View style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: '#deb887',
            marginBottom: 5,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: '#cd853f',
          }}>
            {/* Ears */}
            <View style={{
              position: 'absolute',
              top: -8,
              left: 8,
              width: 15,
              height: 15,
              borderRadius: 8,
              backgroundColor: '#deb887',
              borderWidth: 1,
              borderColor: '#cd853f',
            }} />
            <View style={{
              position: 'absolute',
              top: -8,
              right: 8,
              width: 15,
              height: 15,
              borderRadius: 8,
              backgroundColor: '#deb887',
              borderWidth: 1,
              borderColor: '#cd853f',
            }} />
            {/* Eyes */}
            <View style={{
              flexDirection: 'row',
              marginTop: 8,
              gap: 8,
            }}>
              <View style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#000',
              }} />
              <View style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#000',
              }} />
            </View>
            {/* Nose */}
            <View style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#000',
              marginTop: 2,
            }} />
          </View>

          {/* Bear body */}
          <View style={{
            width: 40,
            height: 60,
            borderRadius: 20,
            backgroundColor: '#deb887',
            borderWidth: 2,
            borderColor: '#cd853f',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 16 }}>💙</Text>
          </View>
        </Animated.View>

        {/* Female Bear */}
        <Animated.View
          style={{
            alignItems: 'center',
            marginLeft: 10,
            transform: [{ rotate: wiggleRotate }],
          }}
        >
          {/* Bear face */}
          <View style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: '#f4a460',
            marginBottom: 5,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: '#d2691e',
          }}>
            {/* Ears */}
            <View style={{
              position: 'absolute',
              top: -8,
              left: 8,
              width: 15,
              height: 15,
              borderRadius: 8,
              backgroundColor: '#f4a460',
              borderWidth: 1,
              borderColor: '#d2691e',
            }} />
            <View style={{
              position: 'absolute',
              top: -8,
              right: 8,
              width: 15,
              height: 15,
              borderRadius: 8,
              backgroundColor: '#f4a460',
              borderWidth: 1,
              borderColor: '#d2691e',
            }} />
            {/* Bow on head */}
            <View style={{
              position: 'absolute',
              top: -5,
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: 14, color: '#ff69b4' }}>🎀</Text>
            </View>
            {/* Eyes */}
            <View style={{
              flexDirection: 'row',
              marginTop: 8,
              gap: 8,
            }}>
              <View style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#000',
              }} />
              <View style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#000',
              }} />
            </View>
            {/* Nose */}
            <View style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#000',
              marginTop: 2,
            }} />
          </View>

          {/* Bear body */}
          <View style={{
            width: 40,
            height: 60,
            borderRadius: 20,
            backgroundColor: '#f4a460',
            borderWidth: 2,
            borderColor: '#d2691e',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 16 }}>💖</Text>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Floating hearts */}
      <Animated.View
        style={{
          position: 'absolute',
          top: -15,
          transform: [
            { translateY: heartTranslateY },
          ],
          opacity: heartOpacity,
        }}
      >
        <Text style={{ fontSize: 20, color: '#ff69b4' }}>💕</Text>
      </Animated.View>

      <Animated.View
        style={{
          position: 'absolute',
          top: -5,
          left: 40,
          transform: [
            { translateY: heartTranslateY },
          ],
          opacity: heartOpacity,
        }}
      >
        <Text style={{ fontSize: 16, color: '#ff1493' }}>💗</Text>
      </Animated.View>

      <Animated.View
        style={{
          position: 'absolute',
          top: -10,
          right: 45,
          transform: [
            { translateY: heartTranslateY },
          ],
          opacity: heartOpacity,
        }}
      >
        <Text style={{ fontSize: 18, color: '#ff69b4' }}>💖</Text>
      </Animated.View>
    </View>
  );
};

const Index = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <View className="p-4">
        <Text>Not logged in.</Text>
      </View>
    );
  }

  // const handleLogout = async () => {
  //   try {
  //     await logout();
  //     router.replace("/login");
  //   } catch (err) {
  //     console.error("Logout failed", err);
  //   }
  // };

  return (
    <ImageBackground
      source={require("../../assets/images/background.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(254, 247, 247, 0.85)', // Optional overlay for readability
        paddingHorizontal: 20,
        paddingTop: 60,
      }}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: '#ff69b4',
            textAlign: 'center',
          }}>
            Our Love Space
          </Text>
          <Text style={{
            fontSize: 16,
            color: '#666',
            textAlign: 'center',
            marginTop: 5,
          }}>
            Where hearts connect 💕
          </Text>
        </View>
        {/* Animated Couple in Center */}
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: -50,
        }}>
          <AnimatedCuteBears />
        </View>
        {/* Enter Couple Space Button */}
        <TouchableOpacity
          style={{
            marginBottom: 30,
            shadowColor: '#ff69b4',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 8,
          }}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/couplespace')
          }
        >
          <View style={{
            backgroundColor: '#ff69b4',
            borderRadius: 25,
            paddingVertical: 18,
            paddingHorizontal: 30,
            alignItems: 'center',
          }}>
            <Text style={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: 18,
              letterSpacing: 0.5,
            }}>
              Enter Your Couple Space
            </Text>
          </View>
        </TouchableOpacity>
        {/* Bottom Navigation Boxes */}
        <View style={{
          flexDirection: 'row',
          gap: 15,
          marginBottom: 40,
        }}>
          {/* Calendar Box */}
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => router.push('/couplespace/calendar')}
          >
            <View style={{
              height: 110,
              backgroundColor: 'white',
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 6,
              borderWidth: 1,
              borderColor: '#f0f0f0',
            }}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>📅</Text>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#333',
                textAlign: 'center',
              }}>
                Calendar
              </Text>
            </View>
          </TouchableOpacity>
          {/* Gift Box */}
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => router.push('/couplespace/gifts')}
          >
            <View style={{
              height: 110,
              backgroundColor: 'white',
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 6,
              borderWidth: 1,
              borderColor: '#f0f0f0',
            }}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>🎁</Text>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#333',
                textAlign: 'center',
              }}>
                Gift
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default Index;
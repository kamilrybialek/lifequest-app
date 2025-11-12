import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface ConfettiCelebrationProps {
  show: boolean;
  onComplete?: () => void;
}

interface Confetto {
  id: number;
  x: number;
  color: string;
  rotation: Animated.Value;
  translateY: Animated.Value;
  translateX: Animated.Value;
}

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  show,
  onComplete,
}) => {
  const confettiPieces = useRef<Confetto[]>([]);
  const confettiCount = 50;

  const colors = ['#58CC02', '#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181'];

  useEffect(() => {
    if (show) {
      // Create confetti pieces
      confettiPieces.current = Array.from({ length: confettiCount }, (_, i) => ({
        id: i,
        x: Math.random() * width,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: new Animated.Value(0),
        translateY: new Animated.Value(-100),
        translateX: new Animated.Value(0),
      }));

      // Animate confetti
      const animations = confettiPieces.current.map((piece) => {
        const randomDuration = 2000 + Math.random() * 1000;
        const randomDelay = Math.random() * 300;
        const randomXMovement = (Math.random() - 0.5) * 200;

        return Animated.parallel([
          Animated.timing(piece.translateY, {
            toValue: height + 100,
            duration: randomDuration,
            delay: randomDelay,
            useNativeDriver: true,
          }),
          Animated.timing(piece.translateX, {
            toValue: randomXMovement,
            duration: randomDuration,
            delay: randomDelay,
            useNativeDriver: true,
          }),
          Animated.timing(piece.rotation, {
            toValue: 360 * (Math.random() > 0.5 ? 1 : -1),
            duration: randomDuration,
            delay: randomDelay,
            useNativeDriver: true,
          }),
        ]);
      });

      Animated.parallel(animations).start(() => {
        if (onComplete) {
          onComplete();
        }
      });
    }
  }, [show]);

  if (!show) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {confettiPieces.current.map((piece) => (
        <Animated.View
          key={piece.id}
          style={[
            styles.confetto,
            {
              backgroundColor: piece.color,
              left: piece.x,
              transform: [
                { translateY: piece.translateY },
                { translateX: piece.translateX },
                {
                  rotate: piece.rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  confetto: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});

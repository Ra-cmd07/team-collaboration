// hooks/useHistoryAnimations.ts
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export function useHistoryAnimations() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    // waveAnim1/2/3 removed (no more moving blocks)

    const bgParticle1 = useRef(new Animated.Value(0)).current;
    const bgParticle2 = useRef(new Animated.Value(0)).current;
    const bgParticle3 = useRef(new Animated.Value(0)).current;

    const bgGrid1 = useRef(new Animated.Value(0)).current;
    const bgGrid2 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        // Pulse loop
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.3,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Particle loops
        const loopParticle = (anim: Animated.Value, duration: number) =>
            Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
                    Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
                ])
            ).start();

        loopParticle(bgParticle1, 8000);
        loopParticle(bgParticle2, 10000);
        loopParticle(bgParticle3, 12000);

        // Grid lines
        Animated.loop(
            Animated.timing(bgGrid1, { toValue: 1, duration: 15000, useNativeDriver: true })
        ).start();
        Animated.loop(
            Animated.timing(bgGrid2, { toValue: 1, duration: 20000, useNativeDriver: true })
        ).start();
    }, [
        fadeAnim,
        slideAnim,
        scaleAnim,
        pulseAnim,
        // waveAnim1/2/3 removed from deps
        bgParticle1,
        bgParticle2,
        bgParticle3,
        bgGrid1,
        bgGrid2,
    ]);

    return {
        fadeAnim,
        slideAnim,
        scaleAnim,
        pulseAnim,
        rotateAnim,
        // waveAnim1/2/3 removed from return
        bgParticle1,
        bgParticle2,
        bgParticle3,
        bgGrid1,
        bgGrid2,
    };
}

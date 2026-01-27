// app/components/WaveHeader.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, LayoutChangeEvent, Easing } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedPath = Animated.createAnimatedComponent(Path);

type Props = {
    height?: number;
    style?: any;
    speed1?: number;       // ms for layer1 travel
    speed2?: number;       // ms for layer2 travel
    bobAmplitude?: number; // px for crest bob
};

export default function WaveHeader({
    height = 100,
    style,
    speed1 = 5000,
    speed2 = 3000,
    bobAmplitude = 7,
}: Props) {
    // pixel-based translate values
    const tx1 = useRef(new Animated.Value(0)).current;
    const tx2 = useRef(new Animated.Value(0)).current;
    const bob = useRef(new Animated.Value(0)).current;

    // measured container width
    const containerW = useRef(0);

    // helper to start loops once width is known
    // helper that restarts the animation when finished
    const startContinuous = (anim: Animated.Value, toValue: number, duration: number) => {
        const run = () => {
            anim.setValue(0); // reset to 0 before each run
            Animated.timing(anim, {
                toValue,
                duration,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (finished) run(); // restart immediately when finished
            });
        };
        run();
    };

    // inside onLayout (after measuring width)
    const startLoops = (w: number) => {
        const travel1 = -w * 0.5;
        const travel2 = -w * 0.6;

        // stop any running animations first
        tx1.stopAnimation();
        tx2.stopAnimation();
        bob.stopAnimation();

        // start continuous loops that explicitly restart
        startContinuous(tx1, travel1, speed1);
        startContinuous(tx2, travel2, speed2);

        // bob (ping-pong) using the same restart pattern
        const startBob = () => {
            bob.setValue(0);
            Animated.sequence([
                Animated.timing(bob, { toValue: -bobAmplitude, duration: 12000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
                Animated.timing(bob, { toValue: bobAmplitude, duration: 12000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            ]).start(({ finished }) => { if (finished) startBob(); });
        };
        startBob();
    };


    // onLayout: measure width and start loops
    const onLayout = (e: LayoutChangeEvent) => {
        const w = e.nativeEvent.layout.width;
        containerW.current = w;
        // start loops only when width is > 0
        if (w > 0) startLoops(w);
    };

    // cleanup on unmount
    useEffect(() => {
        return () => {
            tx1.stopAnimation();
            tx2.stopAnimation();
            bob.stopAnimation();
        };
    }, [tx1, tx2, bob]);

    return (
        <View style={[styles.wrapper, { height }, style]} onLayout={onLayout}>
            {/* Layer 1: large filled wave (anchored to bottom) */}
            <AnimatedView style={[styles.layer, { transform: [{ translateX: tx2 }] }]}>
                <Svg width="200%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none">
                    <Defs>
                        <LinearGradient id="g1" x1="0" y1="0" x2="1" y2="0">
                            <Stop offset="0" stopColor="#7C3AED" stopOpacity="0.18" />
                            <Stop offset="1" stopColor="#f70612ff" stopOpacity="0.08" />
                        </LinearGradient>
                    </Defs>

                    {/* bottom anchored fill (L240,100 L0,100 Z) */}
                    <Path
                        d="M0,50 C40,10 80,110 120,50 C160,-10 200,110 240,50 L240,100 L0,100 Z"
                        fill="url(#g1)"
                    />
                </Svg>
            </AnimatedView>

            {/* Layer 2: secondary filled wave */}
            <AnimatedView style={[styles.layer, { transform: [{ translateX: tx1 }] }]}>
                <Svg width="200%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none">
                    <Defs>
                        <LinearGradient id="g2" x1="0" y1="0" x2="1" y2="0">
                            <Stop offset="0" stopColor="#06B6D4" stopOpacity="0.14" />
                            <Stop offset="1" stopColor="#f70808ff" stopOpacity="0.06" />
                        </LinearGradient>
                    </Defs>

                    <Path
                        d="M0,62 C40,18 80,8 120,48 C160,88 200,28 240,62 L240,100 L0,100 Z"
                        fill="url(#g2)"
                    />
                </Svg>
            </AnimatedView>

            {/* Foreground crest: thin stroke that bobs vertically only */}
            <AnimatedView style={[styles.layer, { transform: [{ translateX: tx1 }] }]}>
                <Svg width="200%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none">
                    <AnimatedPath
                        d="M0,74 C40,46 80,36 120,56 C160,76 200,46 240,74"
                        stroke="rgba(255,255,255,0.18)"
                        strokeWidth={1.6}
                        fill="none"
                        strokeLinecap="round"
                        transform={[{ translateY: bob as any }]}
                    />
                </Svg>
            </AnimatedView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    layer: {
        position: 'absolute',
        left: '-50%',
        top: 0,
        width: '200%',
        height: '100%',
    },
});

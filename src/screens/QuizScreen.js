import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, Dimensions,
} from 'react-native';
import { COLORS, FONTS, RADIUS } from '../theme';
import { QUIZ_QUESTIONS } from '../data/quizData';
import { calculatePersona, selectRandomQuestions } from '../utils/scoringLogic';
import { setPersonaResult } from '../utils/store';

const { width } = Dimensions.get('window');

export default function QuizScreen({ navigation }) {
  const [questions] = useState(() => selectRandomQuestions(QUIZ_QUESTIONS));
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const question = questions[currentQ];
  const progress = (currentQ + 1) / questions.length;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [currentQ]);

  const animateOut = (callback) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  function handleAnswer(persona) {
    if (isAdvancing) return;
    setSelected(persona);
    setIsAdvancing(true);

    const newAnswers = [...answers, persona];

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        animateOut(() => {
          setAnswers(newAnswers);
          setCurrentQ(currentQ + 1);
          setSelected(null);
          setIsAdvancing(false);
        });
      } else {
        const result = calculatePersona(newAnswers);
        setPersonaResult(result);
        navigation.navigate('PersonaReveal');
      }
    }, 350);
  }

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressFill, {
          width: progressAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          }),
        }]} />
      </View>

      <Animated.View style={[styles.inner, {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }]}>

        <Text style={styles.counter}>
          QUESTION {currentQ + 1} OF {questions.length}
        </Text>

        <Text style={styles.question}>{question.question}</Text>

        <View style={styles.options}>
          {question.answers.map((answer, index) => {
            const isSelected = selected === answer.persona;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => handleAnswer(answer.persona)}
                activeOpacity={0.85}
              >
                <Text style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}>
                  {answer.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.hint}>Answers are private — we never show your scores</Text>

      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  progressContainer: {
    height: 4,
    backgroundColor: COLORS.tealLight,
    marginTop: 8,
  },
  progressFill: {
    height: 4,
    backgroundColor: COLORS.teal,
    borderRadius: 2,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  counter: {
    fontSize: 11,
    color: COLORS.hint,
    letterSpacing: 1.5,
    marginBottom: 16,
    fontWeight: FONTS.semibold,
  },
  question: {
    fontSize: 22,
    fontWeight: FONTS.bold,
    color: COLORS.tealDark,
    lineHeight: 30,
    marginBottom: 36,
  },
  options: {
    gap: 12,
  },
  option: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 16,
    backgroundColor: COLORS.white,
  },
  optionSelected: {
    borderColor: COLORS.teal,
    backgroundColor: COLORS.tealLight,
  },
  optionText: {
    fontSize: 15,
    color: COLORS.muted,
    lineHeight: 22,
    fontWeight: FONTS.medium,
  },
  optionTextSelected: {
    color: COLORS.tealDark,
    fontWeight: FONTS.bold,
  },
  hint: {
    fontSize: 11,
    color: COLORS.hint,
    textAlign: 'center',
    marginTop: 32,
    fontStyle: 'italic',
  },
});
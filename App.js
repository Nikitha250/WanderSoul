import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SplashScreen from './src/screens/SplashScreen';
import QuizScreen from './src/screens/QuizScreen';
import PersonaRevealScreen from './src/screens/PersonaRevealScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="PersonaReveal" component={PersonaRevealScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
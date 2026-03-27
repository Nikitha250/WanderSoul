import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SplashScreen      from './src/screens/SplashScreen';
import QuizScreen        from './src/screens/QuizScreen';
import PersonaRevealScreen from './src/screens/PersonaRevealScreen';
import HomeScreen        from './src/screens/HomeScreen';
import TripSetupScreen   from './src/screens/TripSetupScreen';
import GeneratingScreen from './src/screens/GeneratingScreen';
import ItineraryScreen from './src/screens/ItineraryScreen';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash"        component={SplashScreen} />
        <Stack.Screen name="Quiz"          component={QuizScreen} />
        <Stack.Screen name="PersonaReveal" component={PersonaRevealScreen} />
        <Stack.Screen name="Home"          component={HomeScreen} />
        <Stack.Screen name="TripSetup"     component={TripSetupScreen} />
        <Stack.Screen name="Generating" component={GeneratingScreen} options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="Itinerary"  component={ItineraryScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
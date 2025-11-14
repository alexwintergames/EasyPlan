// src/navigation/AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CreateTeamScreen from '../screens/CreateTeamScreen';
import CreateTournamentScreen from '../screens/CreateTournamentScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TeamDetailScreen from '../screens/TeamDetailScreen'; // ✅ Corrigido
import TournamentDetailsScreen from '../screens/TournamentDetailsScreen';
import TutorialScreen from '../screens/TutorialScreen';

import { useAuth } from '../auth/authContext';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : user.firstAccess ? (
          <Stack.Screen name="Tutorial" component={TutorialScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CreateTournament" component={CreateTournamentScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="TournamentDetails" component={TournamentDetailsScreen} />

            {/* ✅ Rotas adicionais */}
            <Stack.Screen name="TeamDetail" component={TeamDetailScreen} />
            <Stack.Screen name="CreateTeam" component={CreateTeamScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

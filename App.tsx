import 'react-native-reanimated';
import { AuthProvider } from "./src/auth/authContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

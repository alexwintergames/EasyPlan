// src/screens/TutorialScreen.tsx
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TutorialScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao EasyPlan!</Text>
      <Text style={styles.text}>Aqui você aprenderá a usar o app rapidamente.</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.replace('Home')}>
        <Text style={styles.buttonText}>Começar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: '700', color: '#FF7A00', marginBottom: 8 },
  text: { color: '#444', marginBottom: 20, textAlign: 'center' },
  button: { backgroundColor: '#FF7A00', paddingVertical: 14, paddingHorizontal: 26, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: '700' },
});

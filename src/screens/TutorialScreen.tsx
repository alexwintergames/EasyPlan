import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../App';
import { supabase } from '../supabase';

type TutorialScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Tutorial'>;

export default function TutorialScreen() {
  const navigation = useNavigation<TutorialScreenNavigationProp>();

  const finishTutorial = async () => {
    // Busca sessão atual do Supabase
    const { data } = await supabase.auth.getSession();

    if (data.session?.user) {
      // Se estiver logado, reseta stack e vai pro Home
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } else {
      // Se não estiver logado, reseta stack e vai pro Login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Bem-vindo ao EasyPlan!</Text>
        <Text style={styles.text}>
          O EasyPlan ajuda escolas e grupos a criarem, organizarem e acompanharem campeonatos com praticidade.
        </Text>

        <View style={styles.step}>
          <Text style={styles.stepTitle}>1. Crie sua conta</Text>
          <Text style={styles.stepText}>
            Faça seu cadastro e acesse o painel. É rápido e gratuito.
          </Text>
        </View>

        <View style={styles.step}>
          <Text style={styles.stepTitle}>2. Explore os campeonatos</Text>
          <Text style={styles.stepText}>
            Acompanhe os torneios da sua escola, veja resultados e estatísticas.
          </Text>
        </View>

        <View style={styles.step}>
          <Text style={styles.stepTitle}>3. Torne-se organizador</Text>
          <Text style={styles.stepText}>
            Use um código de ativação da escola para criar e gerenciar campeonatos.
          </Text>
        </View>

        <View style={styles.step}>
          <Text style={styles.stepTitle}>4. Personalize seu perfil</Text>
          <Text style={styles.stepText}>
            Adicione informações, equipe, esportes preferidos e acompanhe seu desempenho.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={finishTutorial}
        >
          <Text style={styles.buttonText}>Começar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 30,
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 100,
    marginBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FF7A00',
    marginBottom: 15,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 25,
    textAlign: 'center',
  },
  step: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF7A00',
    marginBottom: 5,
  },
  stepText: {
    fontSize: 15,
    color: '#444',
  },
  button: {
    marginTop: 25,
    backgroundColor: '#FF7A00',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

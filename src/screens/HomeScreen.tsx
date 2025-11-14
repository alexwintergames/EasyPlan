// src/screens/HomeScreen.tsx
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../auth/authContext';
import { supabase } from '../supabase';

type Tournament = {
  id: string;
  name: string;
  sport?: string;
  start_date?: string;
  created_at?: string;
};

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tournaments')
        .select('id, name, sport, start_date, created_at')
        .eq('organizer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Erro ao buscar torneios:', error);
        return;
      }

      setTournaments(data || []);
    } catch (err) {
      console.log('Erro inesperado:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchTournaments);
    fetchTournaments();
    return unsub;
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTournaments();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={{ color: '#FF7A00', marginTop: 10 }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header: logo (left) + profile (right) */}
      <View style={styles.header}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image
            source={user?.avatar_url ? { uri: user.avatar_url } : require('../assets/logo.png')}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Seus Campeonatos</Text>

      <FlatList
        data={tournaments}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('TournamentDetails', { tournamentId: item.id })}
          >
            <Text style={styles.name}>{item.name}</Text>
            {item.sport ? <Text style={styles.sport}>{item.sport}</Text> : null}
            <Text style={styles.date}>
              {item.start_date
                ? `Início: ${new Date(item.start_date).toLocaleDateString('pt-BR')}`
                : item.created_at
                ? `Criado em ${new Date(item.created_at).toLocaleDateString('pt-BR')}`
                : ''}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Você ainda não criou nenhum campeonato.</Text>}
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CreateTournament')}>
        <Text style={styles.addText}>Criar Torneio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFF8F0' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  logo: { width: 130, height: 40, resizeMode: 'contain' },
  avatar: { width: 44, height: 44, borderRadius: 22 },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8F0',
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 12,
    color: '#FF7A00',
  },

  card: {
    padding: 18,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FFD4A8',
    shadowColor: '#FF7A00',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  name: { fontSize: 18, fontWeight: '700', color: '#333' },
  sport: { fontSize: 14, color: '#666', marginTop: 6 },
  date: { fontSize: 12, color: '#888', marginTop: 8 },

  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666',
  },

  addButton: {
    backgroundColor: '#FF7A00',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },

  addText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

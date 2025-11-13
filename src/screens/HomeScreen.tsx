// src/screens/HomeScreen.tsx
import { useNavigation } from '@react-navigation/native';
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

interface Tournament {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user, loading: authLoading } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) fetchTournaments();
  }, [user]);

  const fetchTournaments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tournaments')
      .select('id, name, description, created_at')
      .order('created_at', { ascending: false });

    if (!error && data) setTournaments(data as Tournament[]);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTournaments();
    setRefreshing(false);
  };

  if (authLoading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* action button */}
      <TouchableOpacity
        style={styles.mainButton}
        onPress={() =>
          navigation.navigate(
            user?.type === 'organizer' ? 'CreateTournament' : 'Tutorial'
          )
        }
      >
        <Text style={styles.mainButtonText}>
          {user?.type === 'organizer' ? 'Criar Torneio' : 'Entrar em Torneio'}
        </Text>
      </TouchableOpacity>

      {/* tournaments list */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 30 }} size="large" color="#FF7A00" />
      ) : (
        <FlatList
          data={tournaments}
          keyExtractor={(item) => item.id}
          style={{ width: '100%', marginTop: 20 }}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('TournamentDetails', { tournamentId: item.id })} // ✅ corrigido
            >
              <View>
                <Text style={styles.cardTitle}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.cardDesc}>{item.description}</Text>
                ) : null}
                <Text style={styles.cardDate}>
                  Criado em: {new Date(item.created_at || '').toLocaleDateString('pt-BR')}
                </Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.cardBtn}
                  onPress={() => navigation.navigate('TournamentDetails', { tournamentId: item.id })} // ✅ corrigido
                >
                  <Text style={styles.cardBtnText}>Ver detalhes</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum torneio encontrado.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { width: 140, height: 50, resizeMode: 'contain' },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarPlaceholder: { backgroundColor: '#EEE', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontWeight: '700', color: '#999' },

  mainButton: {
    marginTop: 18,
    backgroundColor: '#FF7A00',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  mainButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  card: {
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#222', marginBottom: 6 },
  cardDesc: { color: '#555', marginBottom: 10 },
  cardDate: { fontSize: 12, color: '#888' },

  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  cardBtn: {
    backgroundColor: '#FFB066',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  cardBtnText: { color: '#333', fontWeight: '700' },
  emptyText: { marginTop: 20, color: '#666', textAlign: 'center' },
});

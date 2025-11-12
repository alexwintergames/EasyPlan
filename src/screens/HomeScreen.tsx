// src/screens/HomeScreen.tsx
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
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
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchTournaments();
  }, [user]);

  const fetchTournaments = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('tournaments').select('*');
    if (!error && data) setTournaments(data as Tournament[]);
    setLoading(false);
  };

  if (authLoading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      {/* header: logo left, profile right */}
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
        onPress={() => navigation.navigate(user?.type === 'organizer' ? 'CreateTournament' : 'Tutorial')}
      >
        <Text style={styles.mainButtonText}>
          {user?.type === 'organizer' ? 'Criar Torneio' : 'Entrar em Torneio'}
        </Text>
      </TouchableOpacity>

      {/* tournaments list */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" />
      ) : (
        <FlatList
          data={tournaments}
          keyExtractor={(item) => item.id}
          style={{ width: '100%', marginTop: 18 }}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              {item.description ? <Text style={styles.cardDesc}>{item.description}</Text> : null}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.cardBtn}
                  onPress={() => navigation.navigate('CreateTournament')}
                >
                  <Text style={styles.cardBtnText}>Ver / Entrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={{ marginTop: 20, color: '#666' }}>Nenhum torneio encontrado.</Text>}
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
    borderRadius: 12,
    padding: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  cardDesc: { color: '#555', marginBottom: 10 },

  cardActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  cardBtn: { backgroundColor: '#FFB066', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  cardBtnText: { color: '#333', fontWeight: '700' },
});

import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../auth/authContext';
import { supabase } from '../supabase';

interface Team {
  id: string;
  name: string;
  tournament_id: string;
}

interface Player {
  id: string;
  name: string;
  team_id: string;
}

interface Tournament {
  id: string;
  name: string;
  description?: string | null;
  format?: string | null;
  user_id?: string;
}

export default function TournamentDetailsScreen() {
  const route = useRoute<RouteProp<{ params: { tournamentId: string } }, 'params'>>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<{ [key: string]: string }>({});

  const tournamentId = route.params?.tournamentId;

  useEffect(() => {
    if (tournamentId) fetchData();
  }, [tournamentId]);

  const fetchData = async () => {
    setLoading(true);
    const { data: tData, error: tErr } = await supabase.from('tournaments').select('*').eq('id', tournamentId).maybeSingle();
    const { data: teamData, error: teamErr } = await supabase.from('teams').select('*').eq('tournament_id', tournamentId);
    const { data: playerData, error: pErr } = await supabase.from('team_players').select('*, users(name)').eq('tournament_id', tournamentId);

    if (tErr || teamErr || pErr) {
      console.error(tErr || teamErr || pErr);
      Alert.alert('Erro', 'Falha ao carregar detalhes do torneio.');
    } else {
      setTournament(tData);
      setTeams(teamData || []);
      const playersParsed =
        playerData?.map((p: any) => ({
          id: p.id,
          name: p.users?.name || 'Jogador',
          team_id: p.team_id,
        })) || [];
      setPlayers(playersParsed);
    }
    setLoading(false);
  };

  const handleUpdateScore = async (teamId: string) => {
    const newScore = scores[teamId];
    if (!newScore) return Alert.alert('Aviso', 'Digite um placar válido.');

    const { error } = await supabase.from('teams').update({ score: newScore }).eq('id', teamId);
    if (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao atualizar placar.');
    } else {
      Alert.alert('Sucesso', 'Placar atualizado!');
    }
  };

  if (loading || !tournament) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF7A00" />
      </View>
    );
  }

  const isOrganizer = user?.id === tournament.user_id || user?.type === 'organizer';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
        </TouchableOpacity>

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

      {/* Torneio Info */}
      <Text style={styles.title}>{tournament.name}</Text>
      {tournament.description ? <Text style={styles.desc}>{tournament.description}</Text> : null}
      {tournament.format ? <Text style={styles.desc}>Formato: {tournament.format}</Text> : null}

      {/* Times */}
      <Text style={styles.sectionTitle}>Equipes</Text>
      <FlatList
        data={teams}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>

            <Text style={styles.subTitle}>Jogadores:</Text>
            {players
              .filter((p) => p.team_id === item.id)
              .map((p) => (
                <Text key={p.id} style={styles.playerName}>
                  • {p.name}
                </Text>
              ))}

            {isOrganizer && (
              <View style={styles.scoreContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Placar"
                  value={scores[item.id] || ''}
                  onChangeText={(txt) => setScores({ ...scores, [item.id]: txt })}
                />
                <TouchableOpacity style={styles.smallBtn} onPress={() => handleUpdateScore(item.id)}>
                  <Text style={styles.smallBtnText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma equipe cadastrada.</Text>}
      />
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

  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 15 },
  desc: { color: '#666', marginTop: 4, marginBottom: 6 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#FF7A00' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 6 },
  subTitle: { fontWeight: '600', color: '#555' },
  playerName: { color: '#444', marginLeft: 8, marginTop: 3 },

  scoreContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  smallBtn: {
    backgroundColor: '#FF7A00',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  smallBtnText: { color: '#fff', fontWeight: '700' },

  emptyText: { textAlign: 'center', color: '#999', marginTop: 20 },
});

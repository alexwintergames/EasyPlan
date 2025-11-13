// src/screens/TournamentDetailsScreen.tsx
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

type TournamentDetailsRouteProp = RouteProp<
  { TournamentDetails: { id: string } },
  'TournamentDetails'
>;

export default function TournamentDetailsScreen() {
  const route = useRoute<TournamentDetailsRouteProp>();
  const navigation = useNavigation<any>();
  const { id } = route.params;

  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournament = async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        Alert.alert('Erro', 'Não foi possível carregar o campeonato');
      } else {
        setTournament(data);
      }
      setLoading(false);
    };

    fetchTournament();
  }, [id]);

  const handleDelete = async () => {
    Alert.alert('Confirmar', 'Deseja excluir este campeonato?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('tournaments').delete().eq('id', id);
          if (error) {
            Alert.alert('Erro', 'Não foi possível excluir');
          } else {
            Alert.alert('Sucesso', 'Campeonato excluído');
            navigation.goBack();
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF7A00" />
      </View>
    );
  }

  if (!tournament) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#333' }}>Campeonato não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{tournament.name}</Text>
      <Text style={styles.desc}>{tournament.description || 'Sem descrição'}</Text>
      <View style={styles.line} />
      <Text style={styles.label}>Organizador:</Text>
      <Text style={styles.text}>{tournament.organizer_id}</Text>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteText}>Excluir Campeonato</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    padding: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8F0',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FF7A00',
    marginBottom: 10,
  },
  desc: {
    fontSize: 16,
    color: '#444',
    marginBottom: 15,
  },
  line: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#777',
  },
  text: {
    fontSize: 15,
    color: '#333',
    marginBottom: 20,
  },
  deleteBtn: {
    backgroundColor: '#ff3b30',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteText: {
    color: '#fff',
    fontWeight: '700',
  },
});

import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { supabase } from '../supabase';

export default function CreateTournamentScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [sport, setSport] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');

  const handleCreateTournament = async () => {
    if (!name || !sport || !location || !date) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    const { error } = await supabase.from('tournaments').insert([{ name, sport, location, date, organizer_id: userId }]);

    if (error) Alert.alert('Erro ao criar campeonato', error.message);
    else {
      Alert.alert('Sucesso', 'Campeonato criado com sucesso!');
      navigation.goBack();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Criar Campeonato</Text>

      <TextInput style={styles.input} placeholder="Nome do campeonato" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Esporte" value={sport} onChangeText={setSport} />
      <TextInput style={styles.input} placeholder="Local" value={location} onChangeText={setLocation} />
      <TextInput style={styles.input} placeholder="Data (ex: 20/11/2025)" value={date} onChangeText={setDate} />

      <TouchableOpacity style={styles.button} onPress={handleCreateTournament}>
        <Text style={styles.buttonText}>Criar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#ff8800' }]} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    padding: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF7A00',
    marginBottom: 25,
  },
  input: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  button: {
    width: '90%',
    backgroundColor: '#FF7A00',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});


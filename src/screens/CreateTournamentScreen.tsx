// src/screens/CreateTournamentScreen.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../auth/authContext';
import { supabase } from '../supabase';

export default function CreateTournamentScreen({ navigation }: any) {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [sport, setSport] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [bracketType, setBracketType] = useState('single_elimination');

  const handleCreateTournament = async () => {
    if (!name.trim() || !sport.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    const { data, error } = await supabase
      .from('tournaments')
      .insert([
        {
          name,
          sport,
          start_date: startDate.toISOString(),
          bracket_type: bracketType,
          organizer_id: user?.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível criar o campeonato');
      return;
    }

    Alert.alert('Sucesso', 'Campeonato criado com sucesso!');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Campeonato</Text>

      <Text style={styles.label}>Nome do campeonato</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ex: Interclasse 2025"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Esporte</Text>
      <TextInput
        style={styles.input}
        value={sport}
        onChangeText={setSport}
        placeholder="Ex: Futsal"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Data de início</Text>
      <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateBtn}>
        <Text style={styles.dateText}>
          {startDate.toLocaleDateString('pt-BR')}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          onChange={(event, date) => {
            setShowPicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}

      <Text style={styles.label}>Tipo de chave</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() =>
          setBracketType(
            bracketType === 'single_elimination'
              ? 'double_elimination'
              : 'single_elimination'
          )
        }
      >
        <Text style={{ color: '#333' }}>
          {bracketType === 'single_elimination'
            ? 'Eliminação Simples'
            : 'Eliminação Dupla'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.createBtn} onPress={handleCreateTournament}>
        <Text style={styles.createText}>Criar Campeonato</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF8F0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FF7A00',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#000',
  },
  dateBtn: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  createBtn: {
    backgroundColor: '#FF7A00',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  createText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

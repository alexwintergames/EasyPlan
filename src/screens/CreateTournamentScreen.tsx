// src/screens/CreateTournamentScreen.tsx
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { supabase } from '../supabase';

export default function CreateTournamentScreen() {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Preencha o nome');
      return;
    }
    setSaving(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session?.user) {
      Alert.alert('Erro', 'Usuário não autenticado');
      setSaving(false);
      return;
    }

    const payload = [{ name: name.trim(), description: description || null, organizer_id: session.user.id }];
    const { error } = await supabase.from('tournaments').insert(payload);
    if (error) {
      Alert.alert('Erro', 'Não foi possível criar o torneio');
    } else {
      Alert.alert('Sucesso', 'Torneio criado');
      navigation.goBack();
    }
    setSaving(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Criar Campeonato</Text>
      <TextInput style={styles.input} placeholder="Nome do campeonato" value={name} onChangeText={setName} />
      <TextInput style={[styles.input, { height: 120 }]} placeholder="Descrição (opcional)" value={description} onChangeText={setDescription} multiline />
      <TouchableOpacity style={styles.saveBtn} onPress={handleCreate} disabled={saving}>
        <Text style={styles.saveText}>{saving ? 'Criando...' : 'Criar'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#FFF8F0', flexGrow: 1, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#FF7A00', marginBottom: 18 },
  input: { width: '100%', backgroundColor: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', marginBottom: 12 },
  saveBtn: { backgroundColor: '#FF7A00', padding: 14, borderRadius: 12, width: '100%', alignItems: 'center', marginTop: 8 },
  saveText: { color: '#fff', fontWeight: '700' },
});

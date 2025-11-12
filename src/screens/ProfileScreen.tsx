// src/screens/ProfileScreen.tsx
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../auth/authContext';
import { supabase } from '../supabase';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.from('users').select('*').eq('id', session.user.id).maybeSingle();
      if (!error && data) {
        setName(data.name || '');
        setEmail(data.email || '');
        setType(data.type || '');
        setAvatarUrl(data.avatar_url || '');
      } else {
        // fallback from auth
        setEmail(session.user.email || '');
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session?.user) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      setSaving(false);
      return;
    }

    const updates = [{
      id: session.user.id,
      name: name || null,
      email: email || null,
      type: type || null,
      avatar_url: avatarUrl || null,
    }];

    const { error } = await supabase.from('users').upsert(updates, { onConflict: 'id' });
    if (error) {
      console.log('Upsert erro:', error.message);
      Alert.alert('Erro', 'Não foi possível salvar o perfil.');
    } else {
      Alert.alert('Sucesso', 'Perfil atualizado!');
      await refreshUser();
    }
    setSaving(false);
  };

  const handleActivateCode = async () => {
    if (!code.trim()) {
      Alert.alert('Código vazio', 'Digite um código de ativação.');
      return;
    }
    // Exemplo simples: se código = "ORGANIZER2025" ativa o tipo organizer
    if (code.trim() === 'ORGANIZER2025') {
      setType('organizer');
      Alert.alert('Ativado', 'Tipo de usuário alterado para ORGANIZER.');
      return;
    }
    Alert.alert('Código inválido', 'Código de ativação inválido.');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={avatarUrl ? { uri: avatarUrl } : require('../assets/profile.jpg')} style={styles.profileImg} />

        <TextInput style={styles.input} placeholder="Nome" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Tipo (player / organizer)" value={type} onChangeText={setType} />

        <Text style={styles.sectionTitle}>Ativação de tipo (código)</Text>
        <View style={{ flexDirection: 'row', width: '100%', gap: 10 }}>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Código de ativação" value={code} onChangeText={setCode} />
          <TouchableOpacity style={[styles.smallBtn, { alignSelf: 'center' }]} onPress={handleActivateCode}>
            <Text style={styles.smallBtnText}>Ativar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Avatar URL (opcional)</Text>
        <TextInput style={styles.input} placeholder="https://..." value={avatarUrl} onChangeText={setAvatarUrl} />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveText}>{saving ? 'Salvando...' : 'Salvar Alterações'}</Text>
        </TouchableOpacity>

        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.backText}>Voltar para Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 20, backgroundColor: '#FFF8F0', paddingBottom: 60 },
  profileImg: { width: 120, height: 120, borderRadius: 60, marginBottom: 20 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, marginBottom: 12, backgroundColor: '#fff' },
  saveBtn: { backgroundColor: '#FF7A00', padding: 15, borderRadius: 12, width: '100%', alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold' },
  bottomButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 },
  backBtn: { backgroundColor: '#FFA500', padding: 12, borderRadius: 12, width: '48%', alignItems: 'center' },
  backText: { color: '#fff', fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#FF3B30', padding: 12, borderRadius: 12, width: '48%', alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: 'bold' },
  sectionTitle: { alignSelf: 'flex-start', marginBottom: 8, marginTop: 8, fontWeight: '700', color: '#444' },
  smallBtn: { backgroundColor: '#FFD39A', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  smallBtnText: { fontWeight: '700', color: '#333' },
});

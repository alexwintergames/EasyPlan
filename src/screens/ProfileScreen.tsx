import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

export default function ProfileScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [playerData, setPlayerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [position, setPosition] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: user } = await supabase.auth.getUser();

    if (!user?.user) {
      Alert.alert('Erro', 'Nenhum usuário logado.');
      navigation.replace('Login');
      return;
    }

    // busca infos do users
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.user.id)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar perfil:', error);
      Alert.alert('Erro', 'Falha ao carregar perfil.');
      return;
    }

    if (data) {
      setProfile(data);
      setName(data.name || '');
      setType(data.type || '');
      setAvatarUrl(data.avatar_url || '');
    }

    // busca dados de jogador, se existir
    const { data: player } = await supabase
      .from('players')
      .select('*')
      .eq('user_id', user.user.id)
      .maybeSingle();

    if (player) {
      setPlayerData(player);
      setHeight(player.height?.toString() || '');
      setWeight(player.weight?.toString() || '');
      setPosition(player.position || '');
    }

    setLoading(false);
  };

  const handleSave = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return;

    const updates = {
      id: user.user.id,
      name,
      type,
      avatar_url: avatarUrl,
      email: user.user.email,
    };

    const { error } = await supabase.from('users').upsert(updates, { onConflict: 'id' });
    if (error) {
      console.error('Upsert erro:', error);
      Alert.alert('Erro', 'Falha ao salvar alterações.');
      return;
    }

    if (type === 'player') {
      const playerUpdates = {
        user_id: user.user.id,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        position,
      };
      const { error: playerErr } = await supabase
        .from('players')
        .upsert(playerUpdates, { onConflict: 'user_id' });

      if (playerErr) {
        console.error('Erro ao salvar jogador:', playerErr);
        Alert.alert('Erro', 'Falha ao salvar dados de jogador.');
        return;
      }
    }

    Alert.alert('Sucesso', 'Perfil atualizado!');
    fetchProfile();
  };

  const handleInvite = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Erro', 'Digite um código válido.');
      return;
    }

    const { data, error } = await supabase
      .from('invites')
      .select('*')
      .eq('code', inviteCode.trim())
      .maybeSingle();

    if (error || !data) {
      Alert.alert('Erro', 'Código inválido.');
      return;
    }

    const { target_type } = data;

    const { error: updateErr } = await supabase
      .from('users')
      .update({ type: target_type })
      .eq('id', profile.id);

    if (updateErr) {
      Alert.alert('Erro', 'Falha ao aplicar o código.');
    } else {
      Alert.alert('Sucesso', `Seu tipo de conta agora é: ${target_type}`);
      fetchProfile();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.replace('Login');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Meu Perfil</Text>
      </View>

      <Image
        source={{
          uri: avatarUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
        }}
        style={styles.avatar}
      />

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Tipo (player, organizer...)"
        value={type}
        onChangeText={setType}
      />

      <TextInput
        style={styles.input}
        placeholder="URL do avatar"
        value={avatarUrl}
        onChangeText={setAvatarUrl}
      />

      {type === 'player' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Altura (m)"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Peso (kg)"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Posição"
            value={position}
            onChangeText={setPosition}
          />
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Salvar Alterações</Text>
      </TouchableOpacity>

      <View style={styles.inviteContainer}>
        <TextInput
          style={styles.input}
          placeholder="Código de convite"
          value={inviteCode}
          onChangeText={setInviteCode}
        />
        <TouchableOpacity style={styles.button} onPress={handleInvite}>
          <Text style={styles.buttonText}>Ativar Código</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    padding: 20,
    flexGrow: 1,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    color: '#FF7A00',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#FF7A00',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    backgroundColor: '#FF7A00',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  logoutButton: {
    marginTop: 10,
  },
  logoutText: {
    color: '#FF7A00',
    fontWeight: 'bold',
    fontSize: 15,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  inviteContainer: {
    width: '100%',
    marginTop: 10,
  },
});

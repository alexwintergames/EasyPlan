import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../auth/authContext';
import { supabase } from '../supabase';

interface Player {
  height?: number;
  weight?: number;
  description?: string;
  sports?: string[];
}

export default function ProfileScreen({ navigation }: any) {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url || null);
  const [player, setPlayer] = useState<Player>({});
  const [coupon, setCoupon] = useState('');
  const [loading, setLoading] = useState(false);

  // refs animadas
  const heightAnim = useRef(new Animated.Value(0)).current;
  const weightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!user) return;
    const fetchPlayer = async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // <--- retorna null se não existir

      if (error) {
        console.log('Erro ao buscar player:', error);
        return;
      }

      if (!data) {
        // Cria player vazio se não existir
        const { data: newPlayer, error: insertError } = await supabase
          .from('players')
          .insert({ user_id: user.id })
          .select()
          .maybeSingle();
        if (insertError) console.log('Erro ao criar player:', insertError);
        else {
          setPlayer(newPlayer || {});
          animateBars(0, 0);
        }
      } else {
        setPlayer(data);
        animateBars(data.height || 0, data.weight || 0);
      }
    };
    fetchPlayer();
  }, [user]);

  const animateBars = (height: number, weight: number) => {
    Animated.timing(heightAnim, { toValue: Math.min(height, 200), duration: 700, useNativeDriver: false }).start();
    Animated.timing(weightAnim, { toValue: Math.min(weight, 120), duration: 700, useNativeDriver: false }).start();
  };

  const onHeightChange = (text: string) => {
    const val = Number(text);
    setPlayer({ ...player, height: val });
    animateBars(val, player.weight || 0);
  };

  const onWeightChange = (text: string) => {
    const val = Number(text);
    setPlayer({ ...player, weight: val });
    animateBars(player.height || 0, val);
  };

  const handleLogout = async () => {
    try { await supabase.auth.signOut(); setUser(null); } 
    catch { Alert.alert('Erro', 'Não foi possível sair.'); }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled) setAvatarUrl(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    if (!name.trim()) { Alert.alert('Erro', 'Digite seu nome.'); setLoading(false); return; }

    try {
      let avatar_path: string | null = null;
      if (avatarUrl && !avatarUrl.startsWith('https://')) {
        const fileExt = avatarUrl.split('.').pop();
        const fileName = `${user.id}.${fileExt}`;
        const file = await fetch(avatarUrl);
        const fileBlob = await file.blob();
        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, fileBlob, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        avatar_path = publicData.publicUrl;
      } else if (avatarUrl?.startsWith('https://')) avatar_path = avatarUrl;

      const { error: userError } = await supabase.from('users').update({ name, avatar_url: avatar_path }).eq('id', user.id);
      if (userError) throw userError;

      const { error: playerError } = await supabase.from('players').update({
        height: player.height,
        weight: player.weight,
        description: player.description,
        sports: player.sports,
      }).eq('user_id', user.id);
      if (playerError) throw playerError;

      setUser({ ...user, name, avatar_url: avatar_path });
      Alert.alert('Sucesso', 'Perfil atualizado!');
    } catch (err: any) {
      console.log('Erro salvar perfil:', err);
      Alert.alert('Erro', err.message || 'Não foi possível atualizar.');
    } finally { setLoading(false); }
  };

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return;
    setLoading(true);
    try {
      const { data: invite, error } = await supabase.from('invites').select('*').eq('code', coupon.trim()).single();
      if (error || !invite || invite.used || new Date(invite.expires_at) < new Date()) {
        Alert.alert('Cupom inválido ou expirado');
        setLoading(false);
        return;
      }
      await supabase.from('users').update({ role: 'premium' }).eq('id', user!.id);
      await supabase.from('invites').update({ used: true }).eq('id', invite.id);
      Alert.alert('Sucesso', 'Cupom aplicado!');
      setCoupon('');
    } catch {
      Alert.alert('Erro', 'Não foi possível aplicar o cupom');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>⬅ Voltar</Text>
      </TouchableOpacity>

      <View style={styles.avatarCard}>
        <TouchableOpacity onPress={pickImage}>
          <Image source={avatarUrl ? { uri: avatarUrl } : require('../assets/logo.png')} style={styles.avatar} />
          <View style={styles.avatarOverlay}>
            <Text style={styles.changePhoto}>📸 Alterar</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statBar}>
          <Text style={styles.statLabel}>Altura: {player.height || 0} cm</Text>
          <View style={styles.barBackground}>
            <Animated.View style={[styles.barFill, { width: heightAnim.interpolate({ inputRange: [0, 200], outputRange: ['0%', '100%'] }) }]} />
          </View>
          <TextInput style={styles.statInput} keyboardType="numeric" value={player.height?.toString() || ''} onChangeText={onHeightChange} />
        </View>
        <View style={styles.statBar}>
          <Text style={styles.statLabel}>Peso: {player.weight || 0} kg</Text>
          <View style={styles.barBackground}>
            <Animated.View style={[styles.barFill, { width: weightAnim.interpolate({ inputRange: [0, 120], outputRange: ['0%', '100%'] }) }]} />
          </View>
          <TextInput style={styles.statInput} keyboardType="numeric" value={player.weight?.toString() || ''} onChangeText={onWeightChange} />
        </View>
        <Text style={styles.statLabel}>Esportes</Text>
        <TextInput style={styles.statInput} value={player.sports?.join(', ') || ''} placeholder="Futebol, Basquete" onChangeText={(text) => setPlayer({ ...player, sports: text.split(',').map(s => s.trim()) })} />
      </View>

      <View style={styles.descCard}>
        <Text style={styles.descLabel}>Descrição</Text>
        <TextInput style={[styles.descInput, { height: 80 }]} value={player.description || ''} multiline
          onChangeText={(text) => setPlayer({ ...player, description: text })} placeholder="Fale sobre você..." />
      </View>

      <Text style={styles.label}>Cupom</Text>
      <TextInput style={styles.couponInput} value={coupon} placeholder="Digite o cupom" onChangeText={setCoupon} />
      <TouchableOpacity style={styles.couponBtnFull} onPress={handleApplyCoupon}>
        <Text style={styles.couponText}>Aplicar Cupom</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Salvar Alterações</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0', padding: 20 },
  backBtn: { marginBottom: 10 },
  backText: { fontSize: 16, color: '#FF7A00', fontWeight: '600' },

  avatarCard: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 140, height: 140, borderRadius: 70, borderWidth: 3, borderColor: '#FF7A00' },
  avatarOverlay: { position: 'absolute', bottom: 0, backgroundColor: '#FF7A00AA', padding: 6, borderRadius: 20 },
  changePhoto: { color: '#fff', fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', marginTop: 10 },
  email: { fontSize: 14, color: '#555', marginTop: 2 },

  statsCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  statBar: { marginBottom: 15 },
  statLabel: { fontWeight: '600', color: '#555', marginBottom: 4 },
  barBackground: { width: '100%', height: 12, backgroundColor: '#eee', borderRadius: 6, marginBottom: 4 },
  barFill: { height: 12, backgroundColor: '#FF7A00', borderRadius: 6 },
  statInput: { backgroundColor: '#F8F8F8', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#ddd' },

  descCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  descLabel: { fontWeight: '600', color: '#555', marginBottom: 6 },
  descInput: { backgroundColor: '#F8F8F8', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#ddd', textAlignVertical: 'top' },

  label: { fontWeight: '600', color: '#555', marginBottom: 4 },
  couponInput: { backgroundColor: '#fff', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', marginBottom: 10 },
  couponBtnFull: { backgroundColor: '#FF7A00', padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 15 },

  couponText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  saveBtn: { backgroundColor: '#FF7A00', padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  logoutBtn: { backgroundColor: '#FF3B30', padding: 16, borderRadius: 10, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

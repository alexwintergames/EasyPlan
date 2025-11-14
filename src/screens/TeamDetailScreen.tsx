import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../supabase";

type Player = { id: string; player_name: string };
type Team = { id: string; name: string; players?: Player[] };

export default function TeamDetailScreen({ route, navigation }: any) {
  const { teamId, tournamentId } = route.params;

  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<Team | null>(null);
  const [newPlayer, setNewPlayer] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadTeam = async () => {
    try {
      setLoading(true);

      const { data: tData, error: tErr } = await supabase
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .maybeSingle();
      if (tErr) throw tErr;
      if (!tData) {
        Alert.alert("Erro", "Time não encontrado.");
        navigation.goBack();
        return;
      }

      const { data: players, error: pErr } = await supabase
        .from("team_players")
        .select("id, player_name")
        .eq("team_id", teamId)
        .order("id", { ascending: true });
      if (pErr) throw pErr;

      setTeam({ ...tData, players: players || [] });
    } catch (err: any) {
      console.log("Erro ao carregar time:", err);
      Alert.alert("Erro ao carregar time");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener("focus", loadTeam);
    loadTeam();
    return unsub;
  }, []);

  const addPlayer = async () => {
    if (!newPlayer.trim()) {
      Alert.alert("Erro", "Digite o nome do jogador.");
      return;
    }
    try {
      setLoading(true);
      const { error, data } = await supabase
        .from("team_players")
        .insert([{ team_id: teamId, player_name: newPlayer.trim() }])
        .select(); // retorna o jogador inserido
      if (error) throw error;

      // Atualiza instantaneamente a lista de jogadores
      setTeam((prev) =>
        prev
          ? { ...prev, players: [...(prev.players || []), ...(data || [])] }
          : prev
      );
      setNewPlayer("");
    } catch (err: any) {
      console.log("Erro ao adicionar jogador:", err);
      Alert.alert("Erro ao adicionar jogador");
    } finally {
      setLoading(false);
    }
  };

  const deletePlayer = async (playerId: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("team_players")
        .delete()
        .eq("id", playerId);
      if (error) throw error;

      // Atualiza a lista local sem esperar recarregar
      setTeam((prev) =>
        prev
          ? {
              ...prev,
              players: (prev.players || []).filter((p) => p.id !== playerId),
            }
          : prev
      );
    } catch (err: any) {
      console.log("Erro ao excluir jogador:", err);
      Alert.alert("Erro ao excluir jogador");
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.from("teams").delete().eq("id", teamId);
      if (error) throw error;

      navigation.goBack();
    } catch (err: any) {
      console.log("Erro ao excluir time:", err);
      Alert.alert("Erro ao excluir time");
    } finally {
      setLoading(false);
      setConfirmDelete(false);
    }
  };

  if (loading || !team) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={{ marginTop: 8, color: "#FF7A00" }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{team.name}</Text>

      <Text style={styles.sectionTitle}>Jogadores</Text>
      {team.players && team.players.length > 0 ? (
        <FlatList
          data={team.players}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <Text style={styles.player}>• {item.player_name}</Text>
              <TouchableOpacity onPress={() => deletePlayer(item.id)}>
                <Text style={{ color: "red", fontWeight: "700" }}>Excluir</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noPlayers}>Nenhum jogador cadastrado</Text>
      )}

      <TextInput
        placeholder="Nome do jogador"
        value={newPlayer}
        onChangeText={setNewPlayer}
        style={styles.input}
        placeholderTextColor="#999"
      />

      <TouchableOpacity style={styles.addBtn} onPress={addPlayer}>
        <Text style={styles.addBtnText}>Adicionar Jogador</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.addBtn,
          { backgroundColor: confirmDelete ? "red" : "#FF7A00", marginTop: 12 },
        ]}
        onPress={deleteTeam}
      >
        <Text style={styles.addBtnText}>
          {confirmDelete ? "Clique novamente para excluir o time" : "Excluir Time"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: "#999", marginTop: 12 }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.addBtnText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 20, backgroundColor: "#FFF8F0" },
  title: { fontSize: 26, fontWeight: "800", color: "#FF7A00", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 16, color: "#333" },
  player: { fontSize: 15, marginLeft: 8 },
  noPlayers: { fontStyle: "italic", color: "#777", marginTop: 8 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 12,
  },
  addBtn: {
    backgroundColor: "#FF7A00",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  addBtnText: { color: "#fff", fontWeight: "700" },
});

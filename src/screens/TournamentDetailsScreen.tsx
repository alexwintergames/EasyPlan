import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../supabase";

type Team = { id: string; name: string; playersCount?: number };
type Match = { teamA: Team | null; teamB: Team | null; scoreA?: number; scoreB?: number; winner?: "A" | "B" | null };

export default function TournamentDetailsScreen({ route, navigation }: any) {
  const { tournamentId } = route.params;

  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState<any>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [bracket, setBracket] = useState<{ rounds: Match[][] }>({ rounds: [] });
  const [hasBracket, setHasBracket] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0);

  const load = async () => {
    try {
      setLoading(true);

      // Carregar torneio
      const { data: tData, error: tErr } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", tournamentId)
        .maybeSingle();
      if (tErr) throw tErr;
      if (!tData) {
        Alert.alert("Erro", "Torneio não encontrado.");
        navigation.goBack();
        return;
      }
      setTournament(tData);
      setHasBracket(!!tData.bracket_json);

      // Carregar times e contagem de jogadores
      const { data: tms, error: teamErr } = await supabase
        .from("teams")
        .select("id, name")
        .eq("tournament_id", tournamentId)
        .order("name", { ascending: true });
      if (teamErr) throw teamErr;

      const teamsWithPlayersCount: Team[] = [];
      for (const team of tms || []) {
        const { count, error: cErr } = await supabase
          .from("team_players")
          .select("id", { count: "exact" })
          .eq("team_id", team.id);
        if (cErr) throw cErr;

        teamsWithPlayersCount.push({
          id: team.id!,
          name: team.name!,
          playersCount: count || 0,
        });
      }
      setTeams(teamsWithPlayersCount);

      // Carregar chave se existir
      if (tData.bracket_json) {
        try {
          const parsed = JSON.parse(tData.bracket_json);
          setBracket(parsed);
        } catch {
          setBracket({ rounds: [] });
        }
      }
    } catch (err: any) {
      console.log("Erro ao carregar detalhes:", err);
      Alert.alert("Erro", "Falha ao carregar dados.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener("focus", load);
    load();
    return unsub;
  }, []);

  const nextPowerOfTwo = (n: number) => {
    let p = 1;
    while (p < n) p <<= 1;
    return p;
  };

  const buildRounds = (orderedTeams: Team[]) => {
    const n = orderedTeams.length;
    const size = nextPowerOfTwo(n);
    const byes = size - n;

    const pool: (Team | null)[] = [...orderedTeams];
    for (let i = 0; i < byes; i++) pool.push(null);

    const firstRound: Match[] = [];
    for (let i = 0; i < pool.length; i += 2) {
      firstRound.push({
        teamA: pool[i]!,
        teamB: pool[i + 1]!,
        winner: null,
      });
    }

    const rounds: Match[][] = [firstRound];
    let prev = firstRound;
    while (prev.length > 1) {
      const next: Match[] = [];
      for (let i = 0; i < prev.length; i += 2) next.push({ teamA: null, teamB: null, winner: null });
      rounds.push(next);
      prev = next;
    }

    return { rounds, size };
  };

  const gerarChave = async (teamsToUse?: Team[]) => {
    try {
      const sourceTeams = teamsToUse || [...teams].sort(() => Math.random() - 0.5);
      if (sourceTeams.length < 2) {
        Alert.alert("Erro", "Cadastre ao menos 2 equipes antes de gerar a chave.");
        return;
      }
      const { rounds } = buildRounds(sourceTeams);
      const payload = { rounds };

      const { error } = await supabase
        .from("tournaments")
        .update({ bracket_json: JSON.stringify(payload) })
        .eq("id", tournamentId);
      if (error) throw error;

      setBracket(payload);
      setHasBracket(true);
      if (!teamsToUse) Alert.alert("Sucesso", "Chave gerada.");
    } catch (err: any) {
      console.log("Erro ao gerar chave:", err);
      Alert.alert("Erro", "Não foi possível gerar a chave.");
    }
  };

  const reorganizarChave = () => {
    // embaralhar aleatoriamente a cada clique
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    gerarChave(shuffled);
  };

  const openTeam = (teamId: string) => navigation.navigate("TeamDetail", { teamId, tournamentId });
  const openCreateTeam = () => navigation.navigate("CreateTeam", { tournamentId });

  const handleScoreChange = (roundIndex: number, matchIndex: number, team: "A" | "B", value: string) => {
    const updated = { ...bracket };
    const match = updated.rounds[roundIndex][matchIndex];
    const score = parseInt(value) || 0;

    if (team === "A") match.scoreA = score;
    else match.scoreB = score;

    if (match.scoreA != null && match.scoreB != null) {
      if (match.scoreA > match.scoreB) match.winner = "A";
      else if (match.scoreB > match.scoreA) match.winner = "B";
      else match.winner = null;
      propagateWinner(roundIndex, matchIndex, match.winner, updated);
    }

    setBracket(updated);
    supabase.from("tournaments").update({ bracket_json: JSON.stringify(updated) }).eq("id", tournamentId);
  };

  const propagateWinner = (roundIndex: number, matchIndex: number, winner: "A" | "B" | null, updated: typeof bracket) => {
    if (!winner) return;
    if (roundIndex + 1 >= updated.rounds.length) return;

    const nextMatchIndex = Math.floor(matchIndex / 2);
    const nextMatch = updated.rounds[roundIndex + 1][nextMatchIndex];
    const winningTeam = winner === "A" ? updated.rounds[roundIndex][matchIndex].teamA : updated.rounds[roundIndex][matchIndex].teamB;

    if (matchIndex % 2 === 0) nextMatch.teamA = winningTeam;
    else nextMatch.teamB = winningTeam;
  };

  const deleteTournament = async () => {
    if (deleteStep === 0) {
      setDeleteStep(1);
      Alert.alert("Confirmação", "Clique novamente para confirmar exclusão.");
    } else {
      try {
        await supabase.from("tournaments").delete().eq("id", tournamentId);
        Alert.alert("Sucesso", "Torneio excluído.");
        navigation.goBack();
      } catch {
        Alert.alert("Erro", "Não foi possível excluir o torneio.");
      }
    }
  };

  if (loading)
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={{ marginTop: 8, color: "#FF7A00" }}>Carregando...</Text>
      </View>
    );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>{tournament.name}</Text>
      <Text style={styles.subtitle}>Esporte: {tournament.sport || "-"}</Text>

      <Text style={styles.sectionTitle}>Equipes</Text>
      {teams.length === 0 ? (
        <Text style={styles.txt}>Nenhuma equipe cadastrada.</Text>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(it) => it.id}
          renderItem={({ item }) => (
            <View style={styles.teamCard}>
              <View>
                <Text style={styles.teamName}>{item.name}</Text>
                <Text style={styles.teamPlayersCount}>{item.playersCount || 0} jogadores</Text>
              </View>
              <TouchableOpacity onPress={() => openTeam(item.id)}>
                <Text style={styles.edit}>Editar</Text>
              </TouchableOpacity>
            </View>
          )}
          scrollEnabled={false}
        />
      )}

      <TouchableOpacity style={styles.addTeamBtn} onPress={openCreateTeam}>
        <Text style={styles.addTeamText}>Adicionar Equipe</Text>
      </TouchableOpacity>

      {!hasBracket ? (
        <TouchableOpacity style={styles.generateBtn} onPress={() => gerarChave()}>
          <Text style={styles.generateText}>Gerar Chave</Text>
        </TouchableOpacity>
      ) : (
        <>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 18 }}>
            <Text style={[styles.sectionTitle]}>Chave</Text>
            <TouchableOpacity style={[styles.generateBtn, { padding: 8 }]} onPress={reorganizarChave}>
              <Text style={styles.generateText}>Reorganizar Chave</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal contentContainerStyle={{ paddingVertical: 12 }}>
            {bracket.rounds.map((round, rIndex) => (
              <View key={rIndex} style={styles.roundColumn}>
                <Text style={styles.roundTitle}>Rodada {rIndex + 1}</Text>
                {round.map((match, mIndex) => (
                  <View key={mIndex} style={styles.match}>
                    <View style={[styles.matchRow, match.winner === "A" ? styles.winnerRow : {}]}>
                      <Text style={styles.matchText}>{match.teamA?.name || "BYE"}</Text>
                      <TextInput
                        style={styles.scoreInput}
                        keyboardType="numeric"
                        value={match.scoreA?.toString() || ""}
                        onChangeText={(v) => handleScoreChange(rIndex, mIndex, "A", v)}
                      />
                    </View>
                    <View style={[styles.matchRow, match.winner === "B" ? styles.winnerRow : {}]}>
                      <Text style={styles.matchText}>{match.teamB?.name || "BYE"}</Text>
                      <TextInput
                        style={styles.scoreInput}
                        keyboardType="numeric"
                        value={match.scoreB?.toString() || ""}
                        onChangeText={(v) => handleScoreChange(rIndex, mIndex, "B", v)}
                      />
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </>
      )}

      <TouchableOpacity
        style={[styles.addTeamBtn, { backgroundColor: deleteStep ? "#FF4D4D" : "#999", marginTop: 18 }]}
        onPress={deleteTournament}
      >
        <Text style={styles.addTeamText}>{deleteStep ? "Clique para confirmar exclusão" : "Excluir Torneio"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.addTeamBtn, { backgroundColor: "#999", marginTop: 8 }]} onPress={() => navigation.goBack()}>
        <Text style={styles.addTeamText}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { padding: 20, backgroundColor: "#FFF8F0" },
  title: { fontSize: 26, fontWeight: "800", color: "#FF7A00" },
  subtitle: { fontSize: 16, color: "#555", marginTop: 6 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#333" },
  txt: { marginTop: 8, color: "#666" },
  teamCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#FFE0C2",
  },
  teamName: { fontSize: 16, fontWeight: "700", color: "#333" },
  teamPlayersCount: { fontSize: 13, color: "#777", marginTop: 4 },
  edit: { color: "#FF7A00", fontWeight: "700", marginTop: 4 },
  addTeamBtn: { backgroundColor: "#FF7A00", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 12 },
  addTeamText: { color: "#fff", fontWeight: "700" },
  generateBtn: { backgroundColor: "#FF7A00", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 0 },
  generateText: { color: "#fff", fontWeight: "700" },
  roundColumn: { marginRight: 16, minWidth: 140 },
  roundTitle: { fontWeight: "700", marginBottom: 6, color: "#333" },
  match: { backgroundColor: "#FFE9D6", padding: 8, borderRadius: 8, marginBottom: 12 },
  matchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 4, borderRadius: 6 },
  matchText: { fontWeight: "600" },
  scoreInput: { width: 40, height: 28, borderWidth: 1, borderColor: "#ccc", borderRadius: 6, textAlign: "center", backgroundColor: "#fff" },
  winnerRow: { backgroundColor: "#D4F7D4" },
});

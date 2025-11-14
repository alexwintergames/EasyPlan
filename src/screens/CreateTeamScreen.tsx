import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../supabase";

export default function CreateTeamScreen({ route, navigation }: any) {
  const { tournamentId } = route.params;
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Erro", "Digite o nome do time.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("teams")
      .insert([{ name: name.trim(), tournament_id: tournamentId }]);

    setLoading(false);

    if (error) {
      console.log("Erro ao criar time:", error);
      Alert.alert("Erro", "Não foi possível criar o time.");
      return;
    }

    navigation.goBack(); // TournamentDetailsScreen deve recarregar ao focar!
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Equipe</Text>

      <TextInput
        placeholder="Nome da equipe"
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholderTextColor="#999"
      />

      <TouchableOpacity
        style={styles.btn}
        onPress={handleCreate}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : (
          <Text style={styles.btnText}>Criar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancel} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFF8F0" },
  title: { fontSize: 22, fontWeight: "700", color: "#FF7A00", marginBottom: 16 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
  },
  btn: {
    backgroundColor: "#FF7A00",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
  cancel: { marginTop: 12, alignItems: "center" },
  cancelText: { color: "#666" },
});

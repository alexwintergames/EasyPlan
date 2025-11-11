import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { RootStackParamList } from "../../App";
import { supabase } from "../supabase";

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [name, setName] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [sport, setSport] = useState("");
  const [position, setPosition] = useState("");
  const [loading, setLoading] = useState(true);

  // Carrega os dados do jogador
  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.log("Erro ao buscar perfil:", error.message);
    } else if (data) {
      setName(data.name || "");
      setHeight(data.height?.toString() || "");
      setWeight(data.weight?.toString() || "");
      setSport(data.sport || "");
      setPosition(data.position || "");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Salva os dados no Supabase
  const handleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const updates = {
      id: session.user.id,
      name: name || null,
      height: height ? parseFloat(height.replace(',', '.')) : null,
      weight: weight ? parseFloat(weight.replace(',', '.')) : null,
      sport: sport || null,
      position: position || null,
    };

    const { error } = await supabase
      .from("players")
      .upsert([updates], { onConflict: "id" });

    if (error) {
      console.log("Erro no upsert:", error.message);
      Alert.alert("Erro", "Não foi possível salvar o perfil. Verifique os campos.");
    } else {
      Alert.alert("Sucesso", "Perfil atualizado!");
    }
  };

  // Logout do usuário
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={{ marginTop: 10 }}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/profile.jpg")}
        style={styles.profileImg}
      />

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Altura (ex: 1.80)"
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Peso (ex: 75)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Esporte"
        value={sport}
        onChangeText={setSport}
      />
      <TextInput
        style={styles.input}
        placeholder="Posição"
        value={position}
        onChangeText={setPosition}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Salvar Alterações</Text>
      </TouchableOpacity>

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.backText}>Voltar para Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8F0",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  profileImg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 30,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  saveBtn: {
    backgroundColor: "#FF7A00",
    padding: 15,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  backBtn: {
    backgroundColor: "#FFA500",
    padding: 12,
    borderRadius: 12,
    width: "48%",
    alignItems: "center",
  },
  backText: {
    color: "#fff",
    fontWeight: "bold",
  },
  logoutBtn: {
    backgroundColor: "#FF3B30",
    padding: 12,
    borderRadius: 12,
    width: "48%",
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

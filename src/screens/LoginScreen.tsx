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
import { useAuth } from "../auth/authContext";
import { supabase } from "../supabase";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    setLoading(true);

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError || !loginData.user) {
      setLoading(false);
      Alert.alert("Erro", loginError?.message || "Falha ao logar");
      return;
    }

    // Buscar perfil no banco
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", loginData.user.id)
      .single();

    if (profileError) {
      setLoading(false);
      Alert.alert("Erro", "Falha ao carregar perfil do usuário");
      return;
    }

    // Atualiza contexto do usuário
    setUser({
      id: loginData.user.id,
      email: loginData.user.email || "",
      name: profile?.name || loginData.user.email?.split("@")[0] || "",
      avatar_url: profile?.avatar_url || undefined,
      firstAccess: profile?.firstAccess ?? false,
    });

    setLoading(false);

    // Navegação será controlada pelo AppNavigator via useAuth
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>EasyPlan</Text>
      <Text style={styles.subtitle}>Organize seus campeonatos facilmente</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={styles.input}
        placeholderTextColor="#999"
      />

      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#999"
      />

      <TouchableOpacity
        style={styles.loginBtn}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginText}>Entrar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerText}>Criar uma conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", padding: 24, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 34, fontWeight: "800", color: "#FF7A00", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 40 },
  input: { width: "100%", backgroundColor: "#f2f2f2", padding: 14, borderRadius: 12, marginBottom: 14, fontSize: 16 },
  loginBtn: { width: "100%", backgroundColor: "#FF7A00", padding: 15, borderRadius: 12, alignItems: "center", marginTop: 10 },
  loginText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  registerText: { color: "#FF7A00", fontWeight: "600", marginTop: 20, fontSize: 15 },
});

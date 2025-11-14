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

export default function RegisterScreen({ navigation }: any) {
  const { setUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1 — Cria o usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // 2 — Cria o perfil do usuário na tabela "users"
      const userId = authData.user?.id;
      if (!userId) {
        setError("Erro inesperado: ID do usuário não encontrado.");
        setLoading(false);
        return;
      }

      const defaultAvatar = require('../assets/profile.png'); // imagem padrão

      const { error: profileError } = await supabase.from("users").insert([
        {
          id: userId,
          email,
          name,
          avatar_url: defaultAvatar, // imagem padrão
          firstAccess: true,
        },
      ]);

      if (profileError) {
        setError("Erro ao criar perfil: " + profileError.message);
        setLoading(false);
        return;
      }

      // 3 — Atualiza o contexto do Auth
      setUser({
        id: userId,
        email,
        name,
        avatar_url: defaultAvatar,
        firstAccess: true,
      });

      setLoading(false);
      // Navega pro Tutorial (primeiro acesso)
      navigation.replace("Tutorial");
    } catch (err) {
      setError("Erro inesperado ao registrar usuário.");
      setLoading(false);
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>

      {error !== "" && <Text style={styles.error}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#777"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#777"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#777"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Cadastrar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Já tem conta? Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 30,
    justifyContent: "center",
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#FF7A00",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#f2f2f2",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#FF7A00",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  link: {
    marginTop: 18,
    textAlign: "center",
    color: "#FF7A00",
    fontSize: 15,
    fontWeight: "500",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 14,
  },
});

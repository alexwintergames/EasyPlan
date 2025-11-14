// src/screens/TutorialScreen.tsx
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../auth/authContext";
import { supabase } from "../supabase";

export default function TutorialScreen() {
  const { user, setUser } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const steps = [
    {
      title: "Bem-vindo ao EasyPlan",
      description:
        "Aqui você vai organizar seus campeonatos de forma rápida e simples!",
      image: require("../assets/logo.png"),
    },
    {
      title: "Crie campeonatos",
      description:
        "Clique no botão 'Criar Campeonato' para adicionar torneios com nome, esporte e data de início.",
    },
    {
      title: "Gerencie participantes",
      description:
        "Adicione jogadores, equipes e acompanhe resultados de cada partida facilmente.",
    },
    {
      title: "Compartilhe e divirta-se",
      description:
        "Compartilhe os torneios com seus amigos e aproveite o espírito competitivo!",
    },
  ];

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      finishTutorial();
    }
  };

  const finishTutorial = async () => {
    if (!user?.id) return;
    setLoading(true);

    // Tenta atualizar o perfil
    let { data, error } = await supabase
      .from("users")
      .update({ firstAccess: false })
      .eq("id", user.id)
      .select()
      .single();

    // Se não existir, cria
    if (error && error.code === "PGRST116") {
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          id: user.id,
          email: user.email,
          name: user.name || "",
          firstAccess: false,
        })
        .select()
        .single();

      if (insertError) {
        console.log("Erro ao criar perfil no users:", insertError);
        setLoading(false);
        return;
      }

      data = newUser;
    }

    // Atualiza contexto
    setUser({ ...user, firstAccess: false });
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {steps[step].image && (
          <Image source={steps[step].image} style={styles.image} />
        )}
        <Text style={styles.title}>{steps[step].title}</Text>
        <Text style={styles.description}>{steps[step].description}</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={nextStep}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {step < steps.length - 1 ? "Próximo" : "Começar"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFF8F0",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 15,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FF7A00",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#FF7A00",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

import { NavigationProp, useNavigation } from "@react-navigation/native";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RootStackParamList } from "../../App";

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate("Profile")}
        >
          <Image
            source={require("../assets/profile.jpg")}
            style={styles.icon}
          />
          <Text style={styles.btnText}>Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate("CreateTournament")}
        >
          <Image
            source={require("../assets/trophy.png")}
            style={styles.icon}
          />
          <Text style={styles.btnText}>Campeonato</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: "80%",
    height: 180,
    marginBottom: 50,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  btn: {
    backgroundColor: "#FF7A00",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    width: 120,
    elevation: 3,
  },
  btnText: {
    color: "#fff",
    marginTop: 8,
    fontWeight: "bold",
    fontSize: 16,
  },
  icon: {
    width: 40,
    height: 40,
  },
});

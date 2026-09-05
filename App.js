import React, { useState, useMemo, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Svg, { Path, Circle, Ellipse } from "react-native-svg";
import * as Font from "expo-font";
import { PLANTS } from "./data/plants";

// Load fonts helper
function useLoadFonts(fontMap) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    (async () => {
      await Font.loadAsync(fontMap);
      setLoaded(true);
    })();
  }, []);
  return loaded;
}

// NOTE: For quick testing in Expo Go without committing font binaries, you can set fontsMap = {}
// to skip loading custom fonts. Replace with the require(...) map when you add the TTF files to
// assets/fonts/.
const fontsMap = {};

function Icon({ name, size = 20, color = "black" }) {
  const stroke = { stroke: color, strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };
  switch (name) {
    case "search":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
          <Circle cx="11" cy="11" r="6.5" />
          <Path d="M20 20l-4.3-4.3" />
        </Svg>
      );
    case "back":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
          <Path d="M15 5 L8 12l7 7" />
        </Svg>
      );
    case "camera":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
          <Path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z" />
          <Circle cx="12" cy="13" r="3.3" fill={color} stroke="none" />
        </Svg>
      );
    case "sparkle":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
          <Path d="M12 3l1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3Z" />
        </Svg>
      );
    case "x":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
          <Path d="M6 6l12 12M18 6 6 18" />
        </Svg>
      );
    default:
      return null;
  }
}

function PlantGlyph({ shape = "herb", tint = "#3E7C6E", size = 64 }) {
  return (
    <View style={{ width: size, height: size, borderRadius: 18, backgroundColor: `${tint}22`, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size * 0.66} height={size * 0.66} viewBox="0 0 48 48">
        <Ellipse cx="24" cy="25" rx="9" ry="4" fill={tint} fillOpacity={0.85} />
        <Path d="M24 10 C 16 12, 14 20, 24 25 C 34 20, 32 12, 24 10 Z" fill={tint} fillOpacity={0.9} />
      </Svg>
    </View>
  );
}

function PlantCard({ plant, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(plant)}>
      <PlantGlyph shape={plant.shape} tint={plant.tint || "#2F4A3C"} />
      <View style={{ marginTop: 8 }}>
        <Text style={styles.cardTitle}>{plant.name_gu}</Text>
        <Text style={styles.cardSubtitle}>{plant.name_en}</Text>
      </View>
    </TouchableOpacity>
  );
}

function PlantDetailModal({ visible, plant, onClose, notice }) {
  if (!plant) return null;
  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FAF6EC" }}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={onClose} style={styles.iconButton}>
            <Icon name="back" size={18} color="#24382C" />
          </TouchableOpacity>
          <Text style={styles.headerBackText}>યાદી પર પાછા</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {notice ? (
            <View style={styles.noticeBox}>
              <Text style={{ color: "#C4881F", marginBottom: 6 }}>✦ સૂચન</Text>
              <Text style={{ color: "#7C5A2E" }}>{notice}</Text>
            </View>
          ) : null}

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <PlantGlyph shape={plant.shape} tint={plant.tint || "#2F4A3C"} size={80} />
            <View>
              <Text style={styles.detailName}>{plant.name_gu}</Text>
              <Text style={styles.detailLatin}>{plant.name_en}{plant.sci ? ` · ${plant.sci}` : ""}</Text>
            </View>
          </View>

          {[
            { key: "watering", label: "પાણી આપવું" },
            { key: "humidity", label: "ભેજ" },
            { key: "temperature", label: "તાપમાન" },
            { key: "food", label: "ખાતર" },
            { key: "light", label: "પ્રકાશ" },
          ].map((cat) => (
            <View key={cat.key} style={styles.infoRow}>
              <View style={styles.infoIconWrap} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>{cat.label}</Text>
                <Text style={styles.infoText}>{plant[cat.key] || "—"}</Text>
              </View>
            </View>
          ))}

          {plant.tips ? (
            <View style={styles.tipsBox}>
              <Text style={styles.tipsTitle}>✦ ખાસ ટીપ</Text>
              <Text style={styles.tipsText}>{plant.tips}</Text>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function IdentifyTab({ onResult }) {
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState("idle");
  const [err, setErr] = useState("");

  const pickImage = async () => {
    setErr("");
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setErr("કેમેરા/ફાઈલ સેવા માટે પરવાનગી આપો.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7 });
    if (!result.cancelled) {
      setImage(result);
    }
  };

  const takePhoto = async () => {
    setErr("");
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setErr("કેમેરા માટે પરવાનગી આપો.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7 });
    if (!result.cancelled) setImage(result);
  };

  const identify = async () => {
    if (!image?.base64) return;
    setStatus("loading");
    setErr("");
    try {
      // IMPORTANT: Replace with your backend endpoint which calls the LLM/vision API securely
      const res = await fetch("https://your-backend.example.com/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ media_type: "image/jpeg", base64: image.base64 }),
      });
      if (!res.ok) throw new Error("network");
      const parsed = await res.json();
      if (!parsed.is_plant) {
        setErr("આ ફોટામાં કોઈ છોડ સમજાયો નહીં.");
        setStatus("idle");
        return;
      }
      onResult({
        id: "id-" + Date.now(),
        name_gu: parsed.name_gu,
        name_en: parsed.name_en,
        sci: parsed.sci,
        watering: parsed.watering,
        humidity: parsed.humidity,
        temperature: parsed.temperature,
        food: parsed.food,
        light: parsed.light,
        tips: parsed.tips,
        shape: parsed.shape,
        tint: "#3E7C6E",
      });
      setStatus("idle");
    } catch (e) {
      console.error(e);
      setErr("ઓળખવામાં તકલીફ આવી — ફરી પ્રયાસ કરો.");
      setStatus("idle");
    }
  };

  return (
    <View style={{ padding: 18 }}>
      <Text style={styles.sectionTitle}>ફોટો પરથી છોડ ઓળખો</Text>
      <Text style={styles.sectionDesc}>તમારા છોડનો સ્પષ્ટ ફોટો અપલોડ કરો — પાંદડાં અને દાંડી સારી રીતે દેખાતા હોવા જોઈએ.</Text>

      {!image ? (
        <View style={{ marginTop: 12 }}>
          <TouchableOpacity style={styles.bigButton} onPress={pickImage}>
            <Icon name="camera" size={22} color="#C4881F" />
            <Text style={styles.bigButtonText}>ગેલેરીમાંથી પસંદ કરો</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.bigButton, { marginTop: 8 }]} onPress={takePhoto}>
            <Text style={styles.bigButtonText}>ફોટો લો</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ marginTop: 12 }}>
          <Image source={{ uri: image.uri }} style={{ width: "100%", height: 300, borderRadius: 12 }} resizeMode="cover" />
          <TouchableOpacity style={[styles.bigButton, { marginTop: 10 }]} onPress={identify}>
            {status === "loading" ? <ActivityIndicator /> : <Text style={styles.bigButtonText}>છોડ ઓળખો</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryButton, { marginTop: 8 }]} onPress={() => setImage(null)}>
            <Text style={styles.secondaryButtonText}>ફોટો હટાવો</Text>
          </TouchableOpacity>
        </View>
      )}

      {err ? <Text style={{ color: "#B9552D", marginTop: 12 }}>{err}</Text> : null}
    </View>
  );
}

export default function App() {
  const loaded = useLoadFonts(fontsMap);
  const [tab, setTab] = useState("browse");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState(null);

  const leafTints = ["#2F4A3C", "#3E7C6E", "#7C9473", "#5C7A4A", "#4A6350", "#6E8B5C"];
  const plantsWithTint = useMemo(() => PLANTS.map((p, i) => ({ ...p, tint: p.tint || leafTints[i % leafTints.length] })), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return plantsWithTint;
    return plantsWithTint.filter((p) => p.name_gu.toLowerCase().includes(q) || p.name_en.toLowerCase().includes(q) || (p.sci || "").toLowerCase().includes(q));
  }, [query, plantsWithTint]);

  if (!loaded) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FAF6EC" }}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAF6EC" }}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={styles.logo}>
            <Svg width={18} height={18} viewBox="0 0 24 24"><Path d="M5 19c8.5 0 14-5.5 14-14 0 0-11-2-14 8-1.2 4-1 6 0 6Z" fill="#E2A331" /></Svg>
          </View>
          <Text style={styles.headerTitle}>છોડ સંભાળ માર્ગદર્શિકા</Text>
        </View>
        <Text style={styles.headerSubtitle}>પાણી, ભેજ, તાપમાન, ખાતર અને પ્રકાશ — બધું એક જ જગ્યા</Text>

        <View style={styles.tabWrap}>
          <TouchableOpacity onPress={() => setTab("browse")} style={[styles.tabButton, tab === "browse" && styles.tabActive]}><Text style={tab === "browse" ? styles.tabTextActive : styles.tabText}>બ્રાઉઝ</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setTab("identify")} style={[styles.tabButton, tab === "identify" && styles.tabActive]}><Text style={tab === "identify" ? styles.tabTextActive : styles.tabText}>ઓળખો</Text></TouchableOpacity>
        </View>
      </View>

      {tab === "browse" && (
        <ScrollView style={{ flex: 1 }}>
          <View style={{ padding: 18 }}>
            <View style={styles.searchWrap}>
              <Icon name="search" size={18} color="#9CA491" />
              <TextInput style={styles.searchInput} placeholder="છોડનું નામ શોધો…" value={query} onChangeText={setQuery} />
            </View>

            {filtered.length === 0 ? (
              <View style={{ padding: 40 }}><Text style={{ color: "#9CA491" }}>કોઈ છોડ મળ્યો નથી.</Text></View>
            ) : (
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {filtered.map((p) => (
                  <View key={p.id} style={{ width: "50%", padding: 6 }}>
                    <PlantCard plant={p} onPress={(pl) => { setSelected(pl); setNotice(null); }} />
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {tab === "identify" && <IdentifyTab onResult={(pl) => { setSelected(pl); setNotice("ફોટા પરથી ઓળખાયેલો છોડ — વિગતો AI દ્વારા પ્રદાન કરવામાં આવી છે."); }} />}

      <PlantDetailModal visible={!!selected} plant={selected} onClose={() => setSelected(null)} notice={notice} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, backgroundColor: "#24382C", borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  logo: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#E2A33122", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FAF6EC", fontSize: 20, fontFamily: "NotoSerifGujarati", marginLeft: 8 },
  headerSubtitle: { color: "#B7C2AE", marginTop: 6, fontSize: 13 },
  tabWrap: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.06)", padding: 6, borderRadius: 12, marginTop: 12 },
  tabButton: { flex: 1, padding: 8, borderRadius: 8, alignItems: "center" },
  tabActive: { backgroundColor: "#FAF6EC" },
  tabText: { color: "#D9E0D0", fontWeight: "700" },
  tabTextActive: { color: "#24382C", fontWeight: "700" },

  searchWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 10, borderRadius: 12, borderColor: "#ECE5D3", borderWidth: 1 },
  searchInput: { flex: 1, marginLeft: 8 },

  card: { backgroundColor: "#fff", padding: 12, borderRadius: 14, borderColor: "#ECE5D3", borderWidth: 1 },
  cardTitle: { fontWeight: "700", fontSize: 14 },
  cardSubtitle: { color: "#9CA491", fontSize: 11 },

  sectionTitle: { fontSize: 18, fontFamily: "NotoSerifGujarati", marginBottom: 6 },
  sectionDesc: { color: "#7C8674", marginBottom: 10 },

  bigButton: { backgroundColor: "#F3EFE1", padding: 14, borderRadius: 12, alignItems: "center" },
  bigButtonText: { fontWeight: "700", color: "#24382C", marginTop: 6 },

  secondaryButton: { backgroundColor: "#fff", padding: 12, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "#ECE5D3" },
  secondaryButtonText: { color: "#7C8674" },

  detailHeader: { flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1, borderColor: "#E3DCC8" },
  iconButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#EFE9D8", alignItems: "center", justifyContent: "center", marginRight: 8 },
  headerBackText: { fontSize: 14, color: "#6B7563" },

  noticeBox: { backgroundColor: "#FBF0DC", borderColor: "#EAD199", borderWidth: 1, padding: 12, borderRadius: 10, marginBottom: 12 },

  detailName: { fontSize: 22, fontFamily: "NotoSerifGujarati", fontWeight: "700" },
  detailLatin: { color: "#7C5A2E", marginTop: 4 },

  infoRow: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "#fff", marginBottom: 10, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: "#ECE5D3" },
  infoIconWrap: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F1F1F1", alignItems: "center", justifyContent: "center", marginRight: 8 },
  infoTitle: { fontWeight: "700" },
  infoText: { color: "#4B5344" },

  tipsBox: { backgroundColor: "#F1EEE1", padding: 12, borderRadius: 12, marginTop: 8 },
  tipsTitle: { fontWeight: "700", marginBottom: 6 },
  tipsText: { color: "#4B5344" },
});

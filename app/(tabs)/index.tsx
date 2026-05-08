import React, { useState, useEffect } from "react";
import { auth, db } from "@/services/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { CATEGORIES } from "@/constants";
import {
  formatDisplay,
  parseToNumber,
  getFirebaseErrorMessage,
} from "@/utils/index";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/useTransactions";
import {
  StyleSheet,
  View,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  Appbar,
  Card,
  Title,
  Paragraph,
  List,
  FAB,
  Text,
  Provider as PaperProvider,
  Portal,
  Modal,
  TextInput,
  Button,
  Avatar,
  useTheme, // Thêm luôn cái này nếu bạn làm Dark Mode
  MD3DarkTheme, // Thêm nếu làm Dark Mode
  MD3LightTheme, // Thêm nếu làm Dark Mode
} from "react-native-paper";
import { createStackNavigator } from "@react-navigation/stack";
import { PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Component from "react-native-paper/lib/typescript/components/List/ListItem";
import { useColorScheme } from "react-native";
const Stack = createStackNavigator();

// --- 1. MÀN HÌNH ĐĂNG NHẬP ---
const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Lỗi", "Vui lòng nhập đầy đủ");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      // Sử dụng hàm đã tạo để lấy thông báo tiếng Việt
      const errorMessage = getFirebaseErrorMessage(error);
      Alert.alert("Đăng nhập thất bại", errorMessage);
    }
  };
  const customLightTheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: "#10b981", // Màu xanh lá chủ đạo
      secondary: "#1e293b",
      background: "#f8fafc", // Nền Slate 50
    },
  };

  const customDarkTheme = {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: "#10b981",
      secondary: "#94a3b8",
      background: "#0f172a", // Nền Slate 900 cực tối
      surface: "#1e293b", // Màu của Card trong dark mode
    },
  };

  return (
    <View style={authStyles.container}>
      <Title style={authStyles.title}>FinanceFlow</Title>
      <Paragraph style={authStyles.subtitle}>
        Quản lý chi tiêu thông minh
      </Paragraph>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={authStyles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        textColor="#1e293b"
        outlineColor="#cbd5e1"
        activeOutlineColor="#10b981"
        placeholderTextColor="#94a3b8"
      />
      <TextInput
        label="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        style={authStyles.input}
        textColor="#1e293b"
        outlineColor="#cbd5e1"
        activeOutlineColor="#10b981"
        placeholderTextColor="#94a3b8"
      />
      <Button
        mode="contained"
        loading={loading}
        onPress={handleLogin}
        style={authStyles.button}
        contentStyle={{ height: 50 }}
        textColor="#fcfcfc"
      >
        Đăng nhập
      </Button>
      <Button
        onPress={() => navigation.navigate("Register")}
        style={{ marginTop: 10 }}
        textColor="#0b80e7"
      >
        Chưa có tài khoản? Đăng ký ngay
      </Button>
    </View>
  );
};

// --- 2. MÀN HÌNH ĐĂNG KÝ ---
const RegisterScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const theme = useTheme();
  const handleRegister = async () => {
    if (password !== confirmPassword)
      return Alert.alert("Lỗi", "Mật khẩu không khớp");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await setDoc(doc(db, "users", userCredential.user.uid), {
        fullName,
        phone,
        email,
        initialBalance: parseFloat(initialBalance) || 0,
        createdAt: serverTimestamp(),
      });
      navigation.replace("Home");
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error);
      Alert.alert("Lỗi đăng ký", error.message);
    }
  };

  return (
    <SafeAreaView
      style={[
        homeStyles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <FlatList
        data={[{ key: "form" }]}
        renderItem={() => (
          <View style={authStyles.container}>
            <Title style={authStyles.title}>Tạo tài khoản</Title>
            <TextInput
              label="Họ và tên"
              value={fullName}
              onChangeText={setFullName}
              mode="outlined"
              style={authStyles.input}
              textColor="#1e293b"
              outlineColor="#cbd5e1"
              activeOutlineColor="#10b981"
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={authStyles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              textColor="#1e293b"
              outlineColor="#cbd5e1"
              activeOutlineColor="#10b981"
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              label="Số điện thoại"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              style={authStyles.input}
              keyboardType="phone-pad"
              textColor="#1e293b"
              outlineColor="#cbd5e1"
              activeOutlineColor="#10b981"
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              label="Số dư ban đầu"
              value={initialBalance}
              onChangeText={setInitialBalance}
              mode="outlined"
              style={authStyles.input}
              keyboardType="numeric"
              textColor="#1e293b"
              outlineColor="#cbd5e1"
              activeOutlineColor="#10b981"
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              mode="outlined"
              style={authStyles.input}
              textColor="#1e293b"
              outlineColor="#cbd5e1"
              activeOutlineColor="#10b981"
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              label="Xác nhận mật khẩu"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              mode="outlined"
              style={authStyles.input}
              textColor="#1e293b"
              outlineColor="#cbd5e1"
              activeOutlineColor="#10b981"
              placeholderTextColor="#94a3b8"
            />
            <Button
              mode="contained"
              onPress={handleRegister}
              style={authStyles.button}
              textColor="#fcfcfc"
            >
              Đăng ký ngay
            </Button>
            <Button textColor="#0b80e7" onPress={() => navigation.goBack()}>
              Quay lại
            </Button>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const screenWidth = Dimensions.get("window").width;
const TransactionChart = ({ data }: { data: any[] }) => {
  const theme = useTheme();
  if (data.length === 0) return null;
  return (
    <Card
      style={{
        marginBottom: 20,
        borderRadius: 24,
        backgroundColor: "#fff",
        elevation: 3,
      }}
    >
      <Card.Content>
        <Title
          style={{
            fontSize: 16,
            marginBottom: 10,
            fontWeight: "bold",
            color: theme.colors.primary,
          }}
        >
          Phân tích chi tiêu
        </Title>
        <PieChart
          data={data}
          width={screenWidth - 80}
          height={200}
          chartConfig={{
            color: (opacity = 1) => theme.colors.onSurface,
            labelColor: (opacity = 1) => theme.colors.onSurface,
          }}
          accessor={"amount"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          center={[10, 0]}
          absolute
        />
      </Card.Content>
    </Card>
  );
};
// --- 3. MÀN HÌNH CHÍNH (HOME) ---
function HomeScreen({ navigation }: any) {
  const [visible, setVisible] = useState(false);
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");
  const [isIncome, setIsIncome] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [userBaseBalance, setUserBaseBalance] = useState(0);
  const [userName, setUserName] = useState("Người dùng");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc"); // desc: mới nhất trước, asc: cũ nhất trước

  const { user } = useAuth();
  const { transactions } = useTransactions();
  const theme = useTheme();

  // Lấy thông tin user từ Firestore
  useEffect(() => {
    if (user) {
      getDoc(doc(db, "users", user.uid)).then((snap) => {
        if (snap.exists()) {
          const userData = snap.data();
          setUserName(userData.fullName || "Người dùng");
          setUserBaseBalance(parseFloat(userData.initialBalance) || 0);
        }
      });
    }
  }, [user]);

  // Sắp xếp transactions theo thời gian
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA =
      a.createdAt instanceof Date
        ? a.createdAt
        : (a.createdAt as any)?.toDate?.() || new Date();
    const dateB =
      b.createdAt instanceof Date
        ? b.createdAt
        : (b.createdAt as any)?.toDate?.() || new Date();
    return sortOrder === "desc"
      ? dateB.getTime() - dateA.getTime()
      : dateA.getTime() - dateB.getTime();
  });

  const getChartData = () => {
    // Chỉ lấy các giao dịch là Chi tiêu (amount < 0)
    const expenses = sortedTransactions.filter((t) => t.amount < 0);

    // Nhóm theo category
    const grouped = expenses.reduce((acc: any, curr) => {
      const category = curr.category || "Khác";
      const amount = Math.abs(curr.amount);
      if (!acc[category]) {
        acc[category] = {
          name: category,
          amount: 0,
          color: curr.color || "#64748b",
          legendFontColor: "#7F7F7F",
          legendFontSize: 12,
        };
      }
      acc[category].amount += amount;
      return acc;
    }, {});

    return Object.values(grouped);
  };

  const handleSave = async () => {
    if (!amount || !note || !selectedCategory) {
      return Alert.alert(
        "Lỗi",
        "Vui lòng nhập đầy đủ thông tin và chọn danh mục",
      );
    }

    const numericAmount = parseToNumber(amount); // Chuyển "1,200,000" thành 1200000
    if (numericAmount <= 0) {
      return Alert.alert("Lỗi", "Vui lòng nhập số tiền lớn hơn 0");
    }

    const categoryData = [...CATEGORIES.income, ...CATEGORIES.expense].find(
      (c) => c.label === selectedCategory,
    );

    try {
      await addDoc(collection(db, "transactions"), {
        userId: auth.currentUser?.uid,
        title: note || selectedCategory,
        amount: isIncome ? numericAmount : numericAmount * -1,
        category: selectedCategory,
        icon: categoryData?.icon || "help-circle",
        color: categoryData?.color || "#000",
        createdAt: serverTimestamp(),
      });
      setVisible(false);
      setAmount("");
      setNote("");
      setSelectedCategory("");
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : getFirebaseErrorMessage(error);
      Alert.alert("Lỗi", errorMessage);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace("Login");
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await deleteDoc(doc(db, "transactions", transactionId));
      Alert.alert("Thành công", "Đã xóa giao dịch");
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : getFirebaseErrorMessage(error);
      Alert.alert("Lỗi", errorMessage);
    }
  };
  const transactionTotal = transactions.reduce((sum, item) => {
    return sum + (parseFloat(String(item.amount)) || 0);
  }, 0);
  const totalBalance = userBaseBalance + transactionTotal;
  return (
    <SafeAreaView
      style={[
        homeStyles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Appbar.Header style={homeStyles.header}>
        <Appbar.Content
          title="FinanceFlow"
          titleStyle={{ fontWeight: "900", color: "#10b981" }}
        />
        <TouchableOpacity onPress={handleLogout} style={{ marginRight: 10 }}>
          <Avatar.Text size={35} label={userName.substring(0, 1)} />
        </TouchableOpacity>
      </Appbar.Header>

      <View style={homeStyles.content}>
        <Card
          style={
            (homeStyles.balanceCard,
            { backgroundColor: theme.colors.elevation.level2 })
          }
        >
          <Card.Content>
            <Text style={{ color: "rgba(255,255,255,0.7)" }}>
              Chào {userName}, số dư của bạn:
            </Text>
            <Title style={homeStyles.balanceAmount}>
              {totalBalance.toLocaleString()} đ
            </Title>
          </Card.Content>
        </Card>

        <FlatList
          data={sortedTransactions}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              <TransactionChart data={getChartData()} />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Title style={homeStyles.sectionTitle}>Lịch sử giao dịch</Title>
                <Button
                  mode="outlined"
                  onPress={() =>
                    setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                  }
                  compact
                  style={{ borderColor: theme.colors.primary }}
                  textColor={theme.colors.primary}
                >
                  {sortOrder === "desc" ? "Mới nhất" : "Cũ nhất"}
                </Button>
              </View>
            </>
          }
          renderItem={({ item }) => {
            // Xác định màu sắc: Ưu tiên màu từ item, nếu không có thì dùng màu xám mặc định
            const baseColor = item.color || "#64748b";
            const backgroundColor = baseColor + "20"; // 20 tương đương với độ trong suốt khoảng 12%

            // Format ngày tháng
            const transactionDate =
              item.createdAt instanceof Date
                ? item.createdAt
                : (item.createdAt as any)?.toDate?.() || new Date();
            const formattedDate = transactionDate.toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            const renderRightActions = () => (
              <TouchableOpacity
                style={{
                  backgroundColor: "#ef4444",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 80,
                  height: "100%",
                  borderRadius: 8,
                  marginRight: 16,
                }}
                onPress={() => {
                  if (Platform.OS === "web") {
                    const confirmed = window.confirm(
                      "Bạn có chắc muốn xóa giao dịch này?",
                    );
                    if (confirmed) {
                      handleDeleteTransaction(item.id);
                    }
                  } else {
                    Alert.alert(
                      "Xác nhận xóa",
                      "Bạn có chắc muốn xóa giao dịch này?",
                      [
                        { text: "Hủy", style: "cancel" },
                        {
                          text: "Xóa",
                          style: "destructive",
                          onPress: () => handleDeleteTransaction(item.id),
                        },
                      ],
                    );
                  }
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>Xóa</Text>
              </TouchableOpacity>
            );

            return (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Swipeable renderRightActions={renderRightActions}>
                  <View style={{ flex: 1 }}>
                    <List.Item
                      title={item.title}
                      description={`${item.category} • ${formattedDate}`}
                      style={{ backgroundColor: theme.colors.surface }}
                      left={(props) => (
                        <Avatar.Icon
                          {...props}
                          size={40}
                          // Icon mặc định nếu dữ liệu cũ không có icon
                          icon={
                            item.icon ||
                            (item.amount > 0 ? "arrow-up" : "arrow-down")
                          }
                          style={{ backgroundColor: backgroundColor }}
                          color={baseColor}
                        />
                      )}
                      right={() => (
                        <Text
                          style={[
                            homeStyles.amountText,
                            { color: item.amount > 0 ? "#10b981" : "#ef4444" },
                          ]}
                        >
                          {item.amount > 0 ? "+" : ""}
                          {item.amount.toLocaleString()} đ
                        </Text>
                      )}
                    />
                  </View>
                </Swipeable>
                <TouchableOpacity
                  style={{
                    padding: 8,
                    marginLeft: 8,
                    backgroundColor: "#ef4444",
                    borderRadius: 4,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => {
                    if (Platform.OS === "web") {
                      const confirmed = window.confirm(
                        "Bạn có chắc muốn xóa giao dịch này?",
                      );
                      if (confirmed) {
                        handleDeleteTransaction(item.id);
                      }
                    } else {
                      Alert.alert(
                        "Xác nhận xóa",
                        "Bạn có chắc muốn xóa giao dịch này?",
                        [
                          { text: "Hủy", style: "cancel" },
                          {
                            text: "Xóa",
                            style: "destructive",
                            onPress: () => handleDeleteTransaction(item.id),
                          },
                        ],
                      );
                    }
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: 12, fontWeight: "bold" }}
                  >
                    Xóa
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </View>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={homeStyles.modalContainer}
        >
          <Title
            style={{
              color: isIncome ? "#10b981" : "#ef4444",
              textAlign: "center",
            }}
          >
            {isIncome ? "Thêm thu nhập" : "Thêm chi tiêu"}
          </Title>
          <TextInput
            label="Số tiền (đ)"
            value={amount}
            onChangeText={(text) => setAmount(formatDisplay(text))} // Tự động thêm dấu phẩy
            keyboardType="numeric"
            mode="outlined"
            style={homeStyles.input}
            right={<TextInput.Affix text="VND" />} // Thêm đơn vị cho chuyên nghiệp
          />
          <TextInput
            label="Ghi chú"
            value={note}
            onChangeText={setNote}
            mode="outlined"
            style={homeStyles.input}
          />
          <Text style={{ marginBottom: 8, fontWeight: "bold" }}>
            Chọn danh mục:
          </Text>
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 16 }}
          >
            {(isIncome ? CATEGORIES.income : CATEGORIES.expense).map((cat) => (
              <Button
                key={cat.label}
                mode={selectedCategory === cat.label ? "contained" : "outlined"}
                onPress={() => setSelectedCategory(cat.label)}
                style={{ margin: 4 }}
                icon={cat.icon}
                compact
              >
                {cat.label}
              </Button>
            ))}
          </View>
          <View style={homeStyles.buttonRow}>
            <Button onPress={() => setVisible(false)}>Hủy</Button>
            <Button
              mode="contained"
              onPress={handleSave}
              style={{ backgroundColor: isIncome ? "#10b981" : "#ef4444" }}
            >
              Lưu
            </Button>
          </View>
        </Modal>

        <FAB.Group
          visible={true}
          open={fabOpen}
          icon={fabOpen ? "close" : "plus"}
          actions={[
            {
              icon: "plus",
              label: "Thu nhập",
              onPress: () => {
                setIsIncome(true);
                setVisible(true);
              },
            },
            {
              icon: "minus",
              label: "Chi tiêu",
              onPress: () => {
                setIsIncome(false);
                setVisible(true);
              },
            },
          ]}
          onStateChange={({ open }) => setFabOpen(open)}
        />
      </Portal>
    </SafeAreaView>
  );
}
const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#10b981",
    background: "#f8fafc",
  },
};

const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#10b981",
    background: "#0f172a",
    surface: "#1e293b",
  },
};
// --- 4. APP ENTRY ---
export default function App() {
  const { user, loading } = useAuth();
  const colorScheme = useColorScheme(); // Lấy chế độ hệ thống (dark/light)

  // Chọn theme tương ứng
  const theme = colorScheme === "dark" ? customDarkTheme : customLightTheme;

  if (loading) {
    return (
      <PaperProvider theme={theme}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </PaperProvider>
  );
}

// --- STYLES CẢI TIẾN ---
const commonShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 3,
};

const authStyles = StyleSheet.create({
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#fff",
    fontSize: 14,
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    backgroundColor: "#f8fafc", // Nền Slate 50 cực kỳ sang trọng
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    color: "#10b981", // Màu Emerald Green đại diện cho tài chính
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
    color: "#171718",
    fontSize: 15,
  },
  button: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: "#10b981",
    elevation: 2,
  },
  secondaryButton: {
    marginTop: 12,
  },
});

const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  content: {
    padding: 20,
    flex: 1,
  },
  balanceCard: {
    backgroundColor: "#1e293b", // Slate đậm sang trọng
    borderRadius: 24,
    padding: 12,
    marginBottom: 24,
    ...commonShadow,
  },
  balanceLabel: {
    color: "rgb(246, 243, 243)",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  balanceAmount: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 20,
    fontWeight: "700",
    color: "#334155",
  },
  listItem: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    paddingVertical: 8,
    ...commonShadow,
  },
  listIcon: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
  },
  amountText: {
    alignSelf: "center",
    fontWeight: "800",
    fontSize: 16,
    marginRight: 8,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 8,
    bottom: 24,
    backgroundColor: "#10b981",
    borderRadius: 16,
    paddingHorizontal: 8,
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 30,
    margin: 20,
    borderRadius: 28,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 24,
    color: "#1e293b",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  saveBtn: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 12,
    backgroundColor: "#10b981",
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
});

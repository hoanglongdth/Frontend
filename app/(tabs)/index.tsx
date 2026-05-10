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
import { getMessaging, getToken } from "firebase/messaging";
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
  ScrollView,
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
  Searchbar,
  Menu,
  ProgressBar,
  Switch,
} from "react-native-paper";
import { createStackNavigator } from "@react-navigation/stack";
import { PieChart, BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Component from "react-native-paper/lib/typescript/components/List/ListItem";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as MailComposer from "expo-mail-composer";
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
// --- COMPONENT BIỂU ĐỒ SO SÁNH THÁNG ---
const MonthlyComparisonChart = ({ data }: { data: any }) => {
  const theme = useTheme();

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
          📊 So sánh chi tiêu theo tháng
        </Title>
        <BarChart
          data={data}
          width={screenWidth - 80}
          height={220}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
            labelColor: (opacity = 1) => theme.colors.onSurface,
            style: {
              borderRadius: 16,
            },
            propsForLabels: {
              fontSize: 12,
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
          showValuesOnTopOfBars={true}
          fromZero={true}
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
  const [period, setPeriod] = useState<"all" | "month" | "week" | "year">(
    "all",
  );
  const [profileVisible, setProfileVisible] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userCreatedAt, setUserCreatedAt] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("Tất cả");
  const [menuVisible, setMenuVisible] = useState(false);
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [budgetInputs, setBudgetInputs] = useState<Record<string, string>>({});
  const [budgetSaving, setBudgetSaving] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const { user } = useAuth();
  const { transactions } = useTransactions();
  const theme = useTheme();

  // Load user data and setup notifications when user changes
  useEffect(() => {
    if (user) {
      setUserEmail(user.email || "");
      getDoc(doc(db, "users", user.uid)).then((snap) => {
        if (snap.exists()) {
          const userData = snap.data();
          setUserName(userData.fullName || "Người dùng");
          setUserBaseBalance(parseFloat(userData.initialBalance) || 0);
          setUserPhone(userData.phone || "");
          setUserCreatedAt(
            userData.createdAt instanceof Date
              ? userData.createdAt
              : (userData.createdAt as any)?.toDate?.() || null,
          );
          const loadedBudgets = (userData.budgets || {}) as Record<
            string,
            number
          >;
          setBudgets(loadedBudgets);
          setBudgetInputs(
            CATEGORIES.expense.reduce(
              (acc, cat) => ({
                ...acc,
                [cat.label]: loadedBudgets[cat.label]
                  ? String(loadedBudgets[cat.label])
                  : "",
              }),
              {} as Record<string, string>,
            ),
          );
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

  // Lọc transactions theo search và category
  const filteredTransactions = sortedTransactions.filter((t) => {
    const matchesSearch =
      searchQuery === "" ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "Tất cả" || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getChartData = (period: "all" | "month" | "week" | "year") => {
    // Chỉ lấy các giao dịch là Chi tiêu (amount < 0)
    const expenses = filteredTransactions.filter((t) => t.amount < 0);

    // Lọc theo period
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "week":
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0); // all
    }

    const filteredExpenses = expenses.filter((t) => {
      const tDate =
        t.createdAt instanceof Date
          ? t.createdAt
          : (t.createdAt as any)?.toDate?.() || new Date();
      return tDate >= startDate;
    });

    // Nhóm theo category
    const grouped = filteredExpenses.reduce((acc: any, curr) => {
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

  const getMonthlyComparisonData = () => {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0); // Cuối tháng trước

    // Chỉ lấy các giao dịch là Chi tiêu (amount < 0)
    const expenses = transactions.filter((t) => t.amount < 0);

    // Tính tổng chi tiêu tháng hiện tại
    const currentMonthExpenses = expenses.filter((t) => {
      const tDate =
        t.createdAt instanceof Date
          ? t.createdAt
          : (t.createdAt as any)?.toDate?.() || new Date();
      return tDate >= currentMonth;
    });

    // Tính tổng chi tiêu tháng trước
    const previousMonthExpenses = expenses.filter((t) => {
      const tDate =
        t.createdAt instanceof Date
          ? t.createdAt
          : (t.createdAt as any)?.toDate?.() || new Date();
      return tDate >= previousMonth && tDate <= previousMonthEnd;
    });

    const currentMonthTotal = currentMonthExpenses.reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0,
    );
    const previousMonthTotal = previousMonthExpenses.reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0,
    );

    // Format tên tháng
    const currentMonthName = now.toLocaleDateString("vi-VN", {
      month: "long",
      year: "numeric",
    });
    const previousMonthDate = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );
    const previousMonthName = previousMonthDate.toLocaleDateString("vi-VN", {
      month: "long",
      year: "numeric",
    });

    return {
      labels: [previousMonthName, currentMonthName],
      datasets: [
        {
          data: [previousMonthTotal, currentMonthTotal],
        },
      ],
    };
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

  // Thống kê profile
  const totalIncome = transactions.reduce(
    (sum, item) => sum + (item.amount > 0 ? item.amount : 0),
    0,
  );
  const totalExpense = transactions.reduce(
    (sum, item) => sum + (item.amount < 0 ? Math.abs(item.amount) : 0),
    0,
  );

  const transactionCount = transactions.length;

  const getMonthlyCategoryExpense = (category: string) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return transactions.reduce((sum, item) => {
      if (item.category !== category || item.amount >= 0) return sum;
      const createdAt =
        item.createdAt instanceof Date
          ? item.createdAt
          : (item.createdAt as any)?.toDate?.();
      if (!createdAt) return sum;
      if (createdAt >= startOfMonth && createdAt < startOfNextMonth) {
        return sum + Math.abs(item.amount);
      }
      return sum;
    }, 0);
  };

  const budgetWarnings = CATEGORIES.expense
    .map((cat) => {
      const budget = budgets[cat.label] || 0;
      if (budget <= 0) return null;
      const spent = getMonthlyCategoryExpense(cat.label);
      const ratio = spent / budget;
      return {
        category: cat.label,
        budget,
        spent,
        ratio,
        status: ratio >= 1 ? "over" : ratio >= 0.9 ? "near" : "ok",
      };
    })
    .filter(
      (
        item,
      ): item is {
        category: string;
        budget: number;
        spent: number;
        ratio: number;
        status: string;
      } => item !== null,
    )
    .filter((item) => item.status !== "ok");

  const handleBudgetInputChange = (category: string, value: string) => {
    setBudgetInputs((prev) => ({
      ...prev,
      [category]: formatDisplay(value.replace(/[^0-9]/g, "")),
    }));
  };

  const handleSaveBudgets = async () => {
    if (!user) return;
    setBudgetSaving(true);
    try {
      const updatedBudgets = CATEGORIES.expense.reduce(
        (acc, cat) => {
          const amount = parseToNumber(budgetInputs[cat.label] || "0");
          if (amount > 0) {
            acc[cat.label] = amount;
          }
          return acc;
        },
        {} as Record<string, number>,
      );
      await setDoc(
        doc(db, "users", user.uid),
        { budgets: updatedBudgets },
        { merge: true },
      );
      setBudgets(updatedBudgets);
      Alert.alert("Thành công", "Đã lưu hạn mức ngân sách");
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : getFirebaseErrorMessage(error);
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setBudgetSaving(false);
    }
  };

  const handleExportReport = async () => {
    if (!user) return;
    setExportLoading(true);

    try {
      // Tạo nội dung HTML cho báo cáo
      const reportDate = new Date().toLocaleDateString("vi-VN");
      const totalIncome = transactions.reduce(
        (sum, item) => sum + (item.amount > 0 ? item.amount : 0),
        0,
      );
      const totalExpense = transactions.reduce(
        (sum, item) => sum + (item.amount < 0 ? Math.abs(item.amount) : 0),
        0,
      );

      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Báo cáo giao dịch - ${userName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .summary-item { display: inline-block; margin: 0 20px; text-align: center; }
            .summary-value { font-size: 24px; font-weight: bold; }
            .income { color: #10b981; }
            .expense { color: #ef4444; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .income-row { background-color: #f0fdf4; }
            .expense-row { background-color: #fef2f2; }
            .footer { margin-top: 30px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Báo cáo giao dịch</h1>
            <h2>${userName}</h2>
            <p>Ngày xuất: ${reportDate}</p>
          </div>

          <div class="summary">
            <div class="summary-item">
              <div class="summary-value income">+${totalIncome.toLocaleString()} đ</div>
              <div>Tổng thu nhập</div>
            </div>
            <div class="summary-item">
              <div class="summary-value expense">-${totalExpense.toLocaleString()} đ</div>
              <div>Tổng chi tiêu</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${(totalIncome - totalExpense).toLocaleString()} đ</div>
              <div>Số dư</div>
            </div>
          </div>

          <h3>Lịch sử giao dịch chi tiết</h3>
          <table>
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Ghi chú</th>
                <th>Danh mục</th>
                <th>Loại</th>
                <th>Số tiền</th>
              </tr>
            </thead>
            <tbody>
      `;

      // Thêm từng giao dịch vào bảng
      sortedTransactions.forEach((transaction) => {
        const date =
          transaction.createdAt instanceof Date
            ? transaction.createdAt
            : (transaction.createdAt as any)?.toDate?.() || new Date();

        const formattedDate = date.toLocaleDateString("vi-VN");
        const type = transaction.amount > 0 ? "Thu nhập" : "Chi tiêu";
        const amount =
          transaction.amount > 0
            ? `+${transaction.amount.toLocaleString()} đ`
            : `-${Math.abs(transaction.amount).toLocaleString()} đ`;
        const rowClass = transaction.amount > 0 ? "income-row" : "expense-row";

        htmlContent += `
          <tr class="${rowClass}">
            <td>${formattedDate}</td>
            <td>${transaction.title}</td>
            <td>${transaction.category}</td>
            <td>${type}</td>
            <td>${amount}</td>
          </tr>
        `;
      });

      htmlContent += `
            </tbody>
          </table>

          <div class="footer">
            <p>Báo cáo được tạo bởi FinanceFlow App</p>
            <p>Tổng số giao dịch: ${transactions.length}</p>
          </div>
        </body>
        </html>
      `;

      // Tạo PDF từ HTML
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      // Kiểm tra xem có thể gửi email không
      const isAvailable = await MailComposer.composeAsync({
        subject: `Báo cáo giao dịch - ${userName}`,
        body: `Xin chào ${userName},\n\nĐính kèm là báo cáo lịch sử giao dịch của bạn từ FinanceFlow App.\n\nThời gian xuất: ${reportDate}\nTổng giao dịch: ${transactions.length}\n\nTrân trọng,\nFinanceFlow Team`,
        attachments: [uri],
      });

      if (!isAvailable) {
        // Nếu không thể gửi email, cho phép chia sẻ file
        Alert.alert(
          "Không thể gửi email",
          "Thiết bị của bạn không hỗ trợ gửi email. Bạn có muốn chia sẻ file báo cáo không?",
          [
            { text: "Hủy", style: "cancel" },
            {
              text: "Chia sẻ",
              onPress: async () => {
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(uri);
                } else {
                  Alert.alert("Lỗi", "Thiết bị không hỗ trợ chia sẻ file");
                }
              },
            },
          ],
        );
      }
    } catch (error: any) {
      console.error("Export error:", error);
      Alert.alert("Lỗi", "Không thể xuất báo cáo. Vui lòng thử lại.");
    } finally {
      setExportLoading(false);
    }
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
        <TouchableOpacity
          onPress={() => setProfileVisible(true)}
          style={{ marginRight: 10 }}
        >
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
            <Text style={{ color: "rgba(20, 19, 19, 0.7)" }}>
              Chào {userName}, số dư của bạn:
            </Text>
            <Title style={homeStyles.balanceAmount}>
              {totalBalance.toLocaleString()} đ
            </Title>
          </Card.Content>
        </Card>

        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              <View style={{ marginBottom: 16 }}>
                <Title style={homeStyles.sectionTitle}>
                  Chọn khoảng thời gian
                </Title>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    marginTop: 8,
                  }}
                >
                  <Button
                    mode={period === "all" ? "contained" : "outlined"}
                    onPress={() => setPeriod("all")}
                    compact
                  >
                    Tất cả
                  </Button>
                  <Button
                    mode={period === "month" ? "contained" : "outlined"}
                    onPress={() => setPeriod("month")}
                    compact
                  >
                    Tháng
                  </Button>
                  <Button
                    mode={period === "week" ? "contained" : "outlined"}
                    onPress={() => setPeriod("week")}
                    compact
                  >
                    Tuần
                  </Button>
                  <Button
                    mode={period === "year" ? "contained" : "outlined"}
                    onPress={() => setPeriod("year")}
                    compact
                  >
                    Năm
                  </Button>
                </View>
              </View>
              <View style={{ marginBottom: 16 }}>
                <Title style={homeStyles.sectionTitle}>Tìm kiếm & Lọc</Title>
                <Searchbar
                  placeholder="Tìm kiếm giao dịch..."
                  onChangeText={setSearchQuery}
                  value={searchQuery}
                  style={{ marginBottom: 8 }}
                />
                <Menu
                  visible={menuVisible}
                  onDismiss={() => setMenuVisible(false)}
                  anchor={
                    <Button
                      onPress={() => setMenuVisible(true)}
                      mode="outlined"
                      style={{ alignSelf: "flex-start" }}
                    >
                      Danh mục: {categoryFilter}
                    </Button>
                  }
                >
                  <Menu.Item
                    onPress={() => {
                      setCategoryFilter("Tất cả");
                      setMenuVisible(false);
                    }}
                    title="Tất cả"
                  />
                  {[...CATEGORIES.income, ...CATEGORIES.expense].map((cat) => (
                    <Menu.Item
                      key={cat.label}
                      onPress={() => {
                        setCategoryFilter(cat.label);
                        setMenuVisible(false);
                      }}
                      title={cat.label}
                    />
                  ))}
                </Menu>
              </View>
              <TransactionChart data={getChartData(period)} />
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

            // Kiểm tra cảnh báo ngân sách cho giao dịch chi tiêu
            const budgetWarning =
              item.amount < 0 && budgets[item.category]
                ? (() => {
                    const spent = getMonthlyCategoryExpense(item.category);
                    const budget = budgets[item.category];
                    const ratio = spent / budget;
                    return ratio >= 0.9 ? (ratio >= 1 ? "over" : "near") : null;
                  })()
                : null;

            return (
              <View style={{ marginBottom: 8 }}>
                <Swipeable renderRightActions={renderRightActions}>
                  <Card style={homeStyles.transactionCard}>
                    <Card.Content style={{ paddingVertical: 12 }}>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        {/* Icon và thông tin chính */}
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            flex: 1,
                          }}
                        >
                          <Avatar.Icon
                            size={48}
                            icon={
                              item.icon ||
                              (item.amount > 0 ? "arrow-up" : "arrow-down")
                            }
                            style={{
                              backgroundColor: backgroundColor,
                              marginRight: 16,
                              borderRadius: 12,
                            }}
                            color={baseColor}
                          />
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: "600",
                                color: theme.colors.onSurface,
                                marginBottom: 2,
                              }}
                            >
                              {item.title}
                            </Text>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 2,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 14,
                                  color: theme.colors.onSurfaceVariant,
                                  marginRight: 8,
                                }}
                              >
                                {item.category}
                              </Text>
                              {budgetWarning && (
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    backgroundColor:
                                      budgetWarning === "over"
                                        ? "#fee2e2"
                                        : "#fef3c7",
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                    borderRadius: 8,
                                  }}
                                >
                                  <Avatar.Icon
                                    size={14}
                                    icon="alert-circle"
                                    style={{ backgroundColor: "transparent" }}
                                    color={
                                      budgetWarning === "over"
                                        ? "#b91c1c"
                                        : "#b45309"
                                    }
                                  />
                                  <Text
                                    style={{
                                      fontSize: 12,
                                      color:
                                        budgetWarning === "over"
                                          ? "#b91c1c"
                                          : "#b45309",
                                      fontWeight: "500",
                                      marginLeft: 2,
                                    }}
                                  >
                                    {budgetWarning === "over"
                                      ? "Đã vượt"
                                      : "Sắp vượt"}
                                  </Text>
                                </View>
                              )}
                            </View>
                            <Text
                              style={{
                                fontSize: 12,
                                color: theme.colors.onSurfaceVariant,
                              }}
                            >
                              {formattedDate}
                            </Text>
                          </View>
                        </View>

                        {/* Số tiền */}
                        <View style={{ alignItems: "flex-end" }}>
                          <Text
                            style={{
                              fontSize: 18,
                              fontWeight: "700",
                              color: item.amount > 0 ? "#10b981" : "#ef4444",
                              marginBottom: 2,
                            }}
                          >
                            {item.amount > 0 ? "+" : ""}
                            {Math.abs(item.amount).toLocaleString()} đ
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              color: theme.colors.onSurfaceVariant,
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                            }}
                          >
                            {item.amount > 0 ? "Thu nhập" : "Chi tiêu"}
                          </Text>
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                </Swipeable>
              </View>
            );
          }}
        />
      </View>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => {
            setVisible(false);
          }}
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

        <Modal
          visible={profileVisible}
          onDismiss={() => setProfileVisible(false)}
          contentContainerStyle={[
            homeStyles.modalContainer,
            { maxHeight: "80%" },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Title
              style={{
                textAlign: "center",
                marginBottom: 20,
                color: theme.colors.primary,
              }}
            >
              Thông tin cá nhân
            </Title>

            {/* Avatar và thông tin cơ bản */}
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <Avatar.Text
                size={100}
                label={userName.substring(0, 1)}
                style={{ backgroundColor: theme.colors.primary }}
              />
              <Title style={{ marginTop: 16, fontSize: 24 }}>{userName}</Title>
              <Paragraph
                style={{
                  fontSize: 16,
                  color: theme.colors.onSurfaceVariant,
                }}
              >
                {userEmail}
              </Paragraph>
              {userPhone ? (
                <Paragraph
                  style={{
                    fontSize: 14,
                    color: theme.colors.onSurfaceVariant,
                  }}
                >
                  📞 {userPhone}
                </Paragraph>
              ) : null}
              {userCreatedAt ? (
                <Paragraph
                  style={{
                    fontSize: 14,
                    color: theme.colors.onSurfaceVariant,
                  }}
                >
                  🗓️ Tham gia: {userCreatedAt.toLocaleDateString("vi-VN")}
                </Paragraph>
              ) : null}
            </View>

            {/* Số dư hiện tại */}
            <Card style={{ marginBottom: 20, borderRadius: 16, elevation: 2 }}>
              <Card.Content style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    marginBottom: 8,
                    color: theme.colors.primary,
                  }}
                >
                  💰 Số dư hiện tại
                </Text>
                <Title
                  style={{
                    fontSize: 28,
                    color: totalBalance >= 0 ? "#10b981" : "#ef4444",
                  }}
                >
                  {totalBalance.toLocaleString()} đ
                </Title>
              </Card.Content>
            </Card>

            {/* Thống kê giao dịch */}
            <Title
              style={{
                fontSize: 18,
                marginBottom: 16,
                color: theme.colors.primary,
              }}
            >
              📊 Thống kê giao dịch
            </Title>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <Card style={{ flex: 1, marginRight: 8, borderRadius: 12 }}>
                <Card.Content style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.colors.onSurfaceVariant,
                    }}
                  >
                    Tổng thu nhập
                  </Text>
                  <Title style={{ fontSize: 18, color: "#10b981" }}>
                    {totalIncome.toLocaleString()} đ
                  </Title>
                </Card.Content>
              </Card>
              <Card style={{ flex: 1, marginLeft: 8, borderRadius: 12 }}>
                <Card.Content style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.colors.onSurfaceVariant,
                    }}
                  >
                    Tổng chi tiêu
                  </Text>
                  <Title style={{ fontSize: 18, color: "#ef4444" }}>
                    {totalExpense.toLocaleString()} đ
                  </Title>
                </Card.Content>
              </Card>
            </View>
            <Card style={{ borderRadius: 12, marginBottom: 24 }}>
              <Card.Content style={{ alignItems: "center" }}>
                <Text
                  style={{ fontSize: 14, color: theme.colors.onSurfaceVariant }}
                >
                  Số giao dịch
                </Text>
                <Title style={{ fontSize: 18, color: theme.colors.primary }}>
                  {transactionCount}
                </Title>
              </Card.Content>
            </Card>

            {/* Ngân sách chi tiêu */}
            <Title
              style={{
                fontSize: 18,
                marginBottom: 16,
                color: theme.colors.primary,
              }}
            >
              🎯 Ngân sách chi tiêu
            </Title>
            <Text
              style={{
                marginBottom: 12,
                color: theme.colors.onSurfaceVariant,
              }}
            >
              Đặt hạn mức cho các danh mục chi tiêu hàng tháng. App sẽ cảnh báo
              khi bạn sắp vượt hạn mức.
            </Text>
            {CATEGORIES.expense.map((cat) => {
              const budget = budgets[cat.label] || 0;
              const spent = getMonthlyCategoryExpense(cat.label);
              const ratio = budget > 0 ? spent / budget : 0;
              const status =
                budget > 0
                  ? ratio >= 1
                    ? "over"
                    : ratio >= 0.9
                      ? "near"
                      : "ok"
                  : "none";
              return (
                <View key={cat.label} style={{ marginBottom: 16 }}>
                  <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                    {cat.label}
                  </Text>
                  <Text
                    style={{
                      marginBottom: 8,
                      color:
                        status === "over"
                          ? "#b91c1c"
                          : status === "near"
                            ? "#b45309"
                            : theme.colors.onSurfaceVariant,
                    }}
                  >
                    {budget > 0
                      ? `Đã dùng ${spent.toLocaleString()} đ / ${budget.toLocaleString()} đ (${(ratio * 100).toFixed(1)}%)`
                      : `Đã dùng ${spent.toLocaleString()} đ`}
                  </Text>
                  {budget > 0 && (
                    <ProgressBar
                      progress={Math.min(ratio, 1)}
                      color={
                        status === "over"
                          ? "#b91c1c"
                          : status === "near"
                            ? "#b45309"
                            : "#10b981"
                      }
                      style={{ height: 8, borderRadius: 4, marginBottom: 8 }}
                    />
                  )}
                  <TextInput
                    label="Hạn mức tháng (đ)"
                    value={budgetInputs[cat.label] || ""}
                    onChangeText={(value) =>
                      handleBudgetInputChange(cat.label, value)
                    }
                    keyboardType="numeric"
                    mode="outlined"
                    style={homeStyles.input}
                    right={<TextInput.Affix text="đ" />}
                  />
                </View>
              );
            })}
            <Button
              mode="contained"
              onPress={handleSaveBudgets}
              loading={budgetSaving}
              style={{ marginBottom: 20, backgroundColor: "#10b981" }}
            >
              Lưu ngân sách
            </Button>

            {/* Buttons */}
            <View style={{ flexDirection: "row", marginTop: 20, gap: 8 }}>
              <Button
                onPress={() => setProfileVisible(false)}
                style={{ flex: 1 }}
              >
                Đóng
              </Button>
              <Button
                mode="outlined"
                loading={exportLoading}
                onPress={handleExportReport}
                style={{
                  flex: 1,
                  borderColor: theme.colors.primary,
                }}
                textColor={theme.colors.primary}
              >
                📊 Xuất báo cáo
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  setProfileVisible(false);
                  Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
                    { text: "Hủy", style: "cancel" },
                    {
                      text: "Đăng xuất",
                      onPress: () => signOut(auth),
                    },
                  ]);
                }}
                style={{
                  flex: 1,
                  backgroundColor: "#ef4444",
                }}
              >
                Đăng xuất
              </Button>
            </View>
          </ScrollView>
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
    color: "#363535",
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
  transactionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9",
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

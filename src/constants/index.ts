// src/constants/index.ts
export const CATEGORIES = {
  income: [
    { label: "Lương", icon: "cash-multiple", color: "#10b981" },
    { label: "Thưởng", icon: "gift", color: "#3b82f6" },
    { label: "Khác", icon: "dots-horizontal-circle", color: "#64748b" },
  ],
  expense: [
    { label: "Ăn uống", icon: "food", color: "#f59e0b" },
    { label: "Di chuyển", icon: "car", color: "#3b82f6" },
    { label: "Mua sắm", icon: "cart", color: "#ec4899" },
    { label: "Nhà cửa", icon: "home", color: "#8b5cf6" },
    { label: "Giải trí", icon: "controller-classic", color: "#ef4444" },
  ],
};

export const FIREBASE_ERRORS = {
  "auth/invalid-email": "Địa chỉ email không hợp lệ.",
  "auth/user-disabled": "Tài khoản này đã bị khóa.",
  "auth/user-not-found": "Không tìm thấy tài khoản với email này.",
  "auth/wrong-password": "Mật khẩu không chính xác.",
  "auth/email-already-in-use":
    "Email này đã được sử dụng bởi một tài khoản khác.",
  "auth/weak-password": "Mật khẩu quá yếu (phải có ít nhất 6 ký tự).",
  "auth/network-request-failed": "Lỗi kết nối mạng. Vui lòng kiểm tra lại.",
  "auth/too-many-requests": "Thao tác quá nhanh. Vui lòng thử lại sau ít phút.",
  "auth/invalid-credential": "Email hoặc mật khẩu không đúng.",
  "permission-denied": "Bạn không có quyền thực hiện thao tác này.",
  unavailable: "Dịch vụ hiện không khả dụng, vui lòng thử lại sau.",
};

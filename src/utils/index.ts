// src/utils/index.ts
export const formatDisplay = (value: string): string => {
  if (!value) return "";
  const numericValue = value.replace(/\D/g, "");
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const parseToNumber = (value: string): number => {
  return parseFloat(value.replace(/,/g, "")) || 0;
};

export const getFirebaseErrorMessage = (error: any): string => {
  const errorCode = error.code;
  const FIREBASE_ERRORS: Record<string, string> = {
    "auth/invalid-email": "Địa chỉ email không hợp lệ.",
    "auth/user-disabled": "Tài khoản này đã bị khóa.",
    "auth/user-not-found": "Không tìm thấy tài khoản với email này.",
    "auth/wrong-password": "Mật khẩu không chính xác.",
    "auth/email-already-in-use":
      "Email này đã được sử dụng bởi một tài khoản khác.",
    "auth/weak-password": "Mật khẩu quá yếu (phải có ít nhất 6 ký tự).",
    "auth/network-request-failed": "Lỗi kết nối mạng. Vui lòng kiểm tra lại.",
    "auth/too-many-requests":
      "Thao tác quá nhanh. Vui lòng thử lại sau ít phút.",
    "auth/invalid-credential": "Email hoặc mật khẩu không đúng.",
    "permission-denied": "Bạn không có quyền thực hiện thao tác này.",
    unavailable: "Dịch vụ hiện không khả dụng, vui lòng thử lại sau.",
  };

  return FIREBASE_ERRORS[errorCode] || "Đã có lỗi xảy ra. Vui lòng thử lại.";
};

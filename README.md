# FinanceFlow - Ứng dụng Quản lý Chi tiêu

Một ứng dụng React Native/Expo để quản lý chi tiêu cá nhân với Firebase.

## Tính năng

- ✅ Đăng nhập/Đăng ký với Firebase Authentication
- ✅ Theo dõi thu nhập và chi tiêu
- ✅ Phân loại giao dịch theo danh mục
- ✅ Hiển thị số dư tài khoản
- ✅ Giao diện đẹp với React Native Paper
- ✅ Hỗ trợ Dark/Light theme

## Cấu trúc dự án

```
src/
├── components/     # Các component tái sử dụng
├── hooks/         # Custom hooks
├── services/      # Firebase services
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── constants/     # Constants và config
```

## Cài đặt

1. Cài đặt dependencies:

```bash
npm install
```

2. Khởi chạy dự án:

```bash
npx expo start
```

## Sử dụng

1. Đăng ký tài khoản mới hoặc đăng nhập
2. Thêm giao dịch thu nhập/chi tiêu
3. Xem số dư và lịch sử giao dịch

## Công nghệ sử dụng

- React Native 0.81.5
- Expo SDK 54
- Firebase (Auth + Firestore)
- React Native Paper
- TypeScript
- React Navigation

## Phát triển

Dự án sử dụng cấu trúc module rõ ràng với TypeScript strict mode để đảm bảo code quality.

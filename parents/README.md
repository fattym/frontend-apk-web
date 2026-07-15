# Parent App (Flutter)

Parent-facing mobile app for EduGuide Schools.

## Setup

1. Install Flutter SDK (>=3.0.0)
2. Run `flutter pub get`
3. Update `lib/core/api/api_client.dart` with your backend URL
4. Run `flutter run`

## Features

- **Shop**: Browse school products (uniforms, books, etc.)
- **Announcements**: View school announcements with featured products
- **Orders**: Track order status, M-Pesa payment, pickup codes
- **Auth**: JWT login with secure token storage

## Architecture

- **State Management**: Provider
- **Routing**: go_router
- **HTTP**: dio with interceptors for JWT refresh
- **Local Storage**: flutter_secure_storage
- **Push Notifications**: firebase_messaging (to be implemented)

## API Endpoints

- `POST /api/auth/login/` - Login
- `GET /api/shop/products/` - List products
- `GET /api/shop/categories/` - List categories
- `POST /api/shop/orders/` - Create order
- `POST /api/shop/orders/{id}/pay_mpesa/` - Pay with M-Pesa
- `POST /api/shop/orders/{id}/pay_fee_balance/` - Add to fee balance
- `GET /api/shop/orders/my_orders/` - List my orders
- `GET /api/messaging/announcements/` - List announcements

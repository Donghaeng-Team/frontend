// API 설정
export { default as apiClient } from './config';
export type { ApiResponse, PaginatedResponse, ApiError } from './config';

// 서비스들
export { authService } from './services/auth';
export { locationService } from './services/location';
export { productService } from './services/product';
export { chatService } from './services/chat';

// 타입들
export type {
  // Auth types
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,

  // Location types
  LocationItem,
  LocationData,

  // Product types
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductSearchParams,

  // Chat types
  ChatRoom,
  ChatParticipant,
  ChatMessage,
  SendMessageRequest,
} from './services/auth';

export type {
  LocationItem as LocationItemType,
  LocationData as LocationDataType,
} from './services/location';

export type {
  Product as ProductType,
  ProductCreateRequest as ProductCreateRequestType,
  ProductUpdateRequest as ProductUpdateRequestType,
  ProductSearchParams as ProductSearchParamsType,
} from './services/product';

export type {
  ChatRoom as ChatRoomType,
  ChatParticipant as ChatParticipantType,
  ChatMessage as ChatMessageType,
  SendMessageRequest as SendMessageRequestType,
} from './services/chat';
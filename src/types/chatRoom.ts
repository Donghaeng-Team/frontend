export interface ChatRoom {
  id: string;
  productName: string;
  productImage?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
  participants: {
    current: number;
    max: number;
  };
  status: 'active' | 'closing' | 'closed';
  creator: boolean; // 채팅방 생성자인지 여부
  buyer: boolean; // 구매 확정 여부
  marketId?: number; // 상품 ID (ProductDetail에서 매칭용)
}

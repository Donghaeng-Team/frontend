import type { ChatRoomResponse } from '../types';
import type { ChatRoom } from '../components/ChatRoomListModal/ChatRoomListModal';

/**
 * API 응답(ChatRoomResponse)을 UI 컴포넌트용 타입(ChatRoom)으로 변환
 */
export function transformChatRoomForUI(room: ChatRoomResponse): ChatRoom {
  return {
    id: room.id.toString(),
    productName: room.title,
    productImage: room.thumbnailUrl || undefined,
    lastMessage: '채팅방이 개설되었습니다', // TODO: 백엔드에서 lastMessage 제공 필요
    lastMessageTime: room.lastMessageAt
      ? new Date(room.lastMessageAt).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      : '',
    unreadCount: 0, // TODO: 백엔드에서 unreadCount 제공 필요
    participants: {
      current: room.currentBuyers,
      max: room.maxBuyers
    },
    status: room.status === 'RECRUITING' ? 'active'
          : room.status === 'RECRUITMENT_CLOSED' ? 'closing'
          : 'closed'
  };
}

/**
 * ChatRoomResponse 배열을 ChatRoom 배열로 변환
 */
export function transformChatRoomsForUI(rooms: ChatRoomResponse[]): ChatRoom[] {
  return rooms.map(transformChatRoomForUI);
}

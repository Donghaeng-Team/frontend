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
          : 'closed',
    creator: room.creator,
    buyer: room.buyer,
    marketId: room.marketId
  };
}

/**
 * ChatRoomResponse 배열을 ChatRoom 배열로 변환
 */
export function transformChatRoomsForUI(rooms: ChatRoomResponse[]): ChatRoom[] {
  return rooms.map(transformChatRoomForUI);
}

/**
 * 마감 시간까지 남은 시간을 계산해서 문자열로 반환
 * @param endTime ISO 8601 형식의 마감 시간
 * @returns "2시간 30분", "30분", "5분", "마감됨" 등
 */
export function calculateTimeRemaining(endTime: string): string {
  const now = new Date();
  const end = new Date(endTime);
  const diffMs = end.getTime() - now.getTime();

  // 이미 마감된 경우
  if (diffMs <= 0) {
    return '마감됨';
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // 1일 이상 남은 경우
  if (diffDays >= 1) {
    const remainingHours = diffHours % 24;
    if (remainingHours > 0) {
      return `${diffDays}일 ${remainingHours}시간`;
    }
    return `${diffDays}일`;
  }

  // 1시간 이상 남은 경우
  if (diffHours >= 1) {
    const remainingMinutes = diffMinutes % 60;
    if (remainingMinutes > 0) {
      return `${diffHours}시간 ${remainingMinutes}분`;
    }
    return `${diffHours}시간`;
  }

  // 1시간 미만인 경우
  if (diffMinutes > 0) {
    return `${diffMinutes}분`;
  }

  return '곧 마감';
}

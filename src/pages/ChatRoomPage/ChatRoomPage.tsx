import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChatRoom from '../../components/ChatRoom';
import BottomNav from '../../components/BottomNav';
import type { ChatMessage } from '../../components/ChatRoom/ChatRoom';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import type { ChatRoomStatus } from '../../types/chat';
import './ChatRoomPage.css';

const ChatRoomPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const hasJoinedRef = useRef(false);

  const {
    initializeWebSocket,
    disconnectWebSocket,
    wsStatus,
    currentRoom,
    messages,
    fetchChatRoom,
    joinChatRoom,
    sendMessage,
    addMessage,
    confirmBuyer,
  } = useChatStore();
  const { user } = useAuthStore();

  // WebSocket 초기화
  useEffect(() => {
    initializeWebSocket();
    return () => {
      disconnectWebSocket();
    };
  }, [initializeWebSocket, disconnectWebSocket]);

  // 채팅방 입장 (중복 방지)
  useEffect(() => {
    if (roomId && user && !hasJoinedRef.current) {
      hasJoinedRef.current = true;
      const numericRoomId = parseInt(roomId, 10);
      joinChatRoom(numericRoomId);
    }

    // cleanup: 컴포넌트 언마운트 시 초기화
    return () => {
      hasJoinedRef.current = false;
    };
  }, [roomId, user]);

  // ChatRoomStatus를 RecruitmentStatus의 status 타입으로 변환
  const convertChatRoomStatus = (status: ChatRoomStatus): 'active' | 'closing' | 'closed' => {
    switch (status) {
      case 'RECRUITING':
        return 'active';
      case 'RECRUITMENT_CLOSED':
        return 'closing';
      case 'COMPLETED':
      case 'CANCELLED':
        return 'closed';
      default:
        return 'active';
    }
  };

  // 채팅 메시지를 ChatRoom 컴포넌트 형식으로 변환
  const formattedMessages: ChatMessage[] = messages.map((msg) => {
    const messageType = msg.senderId === user?.userId ? 'my' : msg.messageType === 'SYSTEM' ? 'system' : 'buyer';

    // 시스템 메시지의 경우 숫자(userId)를 닉네임으로 교체
    let messageContent = msg.messageContent;
    if (messageType === 'system' && msg.senderNickname) {
      // "1님이 참가했습니다" → "홍길동님이 참가했습니다"
      messageContent = messageContent.replace(/^\d+/, msg.senderNickname);
    }

    return {
      id: msg.id.toString(),
      type: messageType,
      content: messageContent,
      sender: msg.senderId === user?.userId ? undefined : {
        name: msg.senderNickname,
        isSeller: msg.senderId === currentRoom?.creatorUserId
      },
      timestamp: new Date(msg.sentAt).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  });

  const productInfo = currentRoom ? {
    name: currentRoom.title,
    price: 15000, // API에서 가격 정보가 없으므로 임시값
    image: currentRoom.thumbnailUrl
  } : {
    name: '로딩중...',
    price: 0,
    image: undefined
  };

  const recruitmentStatus = currentRoom ? {
    current: currentRoom.currentBuyers,
    max: currentRoom.maxBuyers,
    timeRemaining: '2시간 30분', // TODO: 실제 남은 시간 계산
    status: convertChatRoomStatus(currentRoom.status)
  } : {
    current: 0,
    max: 0,
    timeRemaining: '0분',
    status: 'active' as const
  };

  const userRole = (currentRoom && user?.userId === currentRoom.creatorUserId) ? 'seller' : 'buyer';

  const handleBack = () => {
    navigate(-1);
  };

  const handleLeave = () => {
    if (window.confirm('채팅방을 나가시겠습니까?')) {
      navigate('/');
    }
  };

  const handleExtendTime = () => {
    if (roomId && currentRoom) {
      // TODO: 시간 연장 API 호출
      alert('시간 연장 기능 (구현 예정)');
    }
  };

  const handleConfirm = async () => {
    if (roomId && currentRoom) {
      try {
        await confirmBuyer(parseInt(roomId, 10));
        alert('구매자가 확정되었습니다.');
      } catch (error) {
        alert('구매자 확정에 실패했습니다.');
      }
    }
  };

  const handleApply = () => {
    if (roomId) {
      // TODO: 구매 신청 API 호출
      alert('구매 신청 기능 (구현 예정)');
    }
  };

  const handleSendMessage = (message: string) => {
    if (roomId && user && user.userId) {
      const numericRoomId = parseInt(roomId, 10);
      sendMessage(numericRoomId, message, user.userId, user.nickName);
    }
  };

  return (
    <div className="chat-room-page">
      <ChatRoom
        role={userRole}
        productInfo={productInfo}
        recruitmentStatus={recruitmentStatus}
        messages={formattedMessages}
        onBack={handleBack}
        onLeave={handleLeave}
        onExtendTime={handleExtendTime}
        onConfirm={handleConfirm}
        onApply={handleApply}
        onSendMessage={handleSendMessage}
      />
      <BottomNav notificationCount={3} />
    </div>
  );
};

export default ChatRoomPage;

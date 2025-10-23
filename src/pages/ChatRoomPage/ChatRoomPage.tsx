import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChatRoom from '../../components/ChatRoom';
import type { ChatMessage } from '../../components/ChatRoom/ChatRoom';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import './ChatRoomPage.css';

const ChatRoomPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  
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

  // 채팅방 입장
  useEffect(() => {
    if (roomId && user) {
      const numericRoomId = parseInt(roomId, 10);
      joinChatRoom(numericRoomId);
    }
  }, [roomId, user, joinChatRoom]);

  // 채팅 메시지를 ChatRoom 컴포넌트 형식으로 변환
  const formattedMessages: ChatMessage[] = messages.map((msg) => ({
    id: msg.id.toString(),
    type: msg.senderId === user?.id ? 'my' : msg.messageType === 'SYSTEM' ? 'system' : 'buyer',
    content: msg.messageContent,
    sender: msg.senderId === user?.id ? undefined : {
      name: msg.senderNickname,
      isSeller: msg.senderId === currentRoom?.creatorUserId
    },
    timestamp: new Date(msg.sentAt).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }));

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
    status: currentRoom.status
  } : {
    current: 0,
    max: 0,
    timeRemaining: '0분',
    status: 'RECRUITING' as const
  };

  const userRole = (currentRoom && user?.id === currentRoom.creatorUserId) ? 'seller' : 'buyer';

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
    if (roomId && user) {
      const numericRoomId = parseInt(roomId, 10);
      sendMessage(numericRoomId, message, user.id, user.nickname);
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
    </div>
  );
};

export default ChatRoomPage;

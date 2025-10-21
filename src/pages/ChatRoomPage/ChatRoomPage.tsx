import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChatRoom from '../../components/ChatRoom';
import type { ChatMessage } from '../../components/ChatRoom/ChatRoom';
import './ChatRoomPage.css';

const ChatRoomPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();

  // 임시 데이터 - 추후 API로 대체
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'system',
      content: '채팅방이 개설되었습니다.',
      timestamp: '2024-01-15 10:00'
    },
    {
      id: '2',
      type: 'seller',
      content: '안녕하세요! 신선한 사과 공동구매 진행합니다.',
      sender: {
        name: '판매자',
        isSeller: true
      },
      timestamp: '2024-01-15 10:05'
    },
    {
      id: '3',
      type: 'buyer',
      content: '참여하고 싶습니다!',
      sender: {
        name: '구매자1'
      },
      timestamp: '2024-01-15 10:10'
    }
  ]);

  // 임시 상품 정보 - 추후 API로 대체
  const productInfo = {
    name: '청송 사과 5kg (특)',
    price: 15000,
    image: undefined
  };

  // 임시 모집 상태 - 추후 API로 대체
  const recruitmentStatus = {
    current: 3,
    max: 10,
    timeRemaining: '2시간 30분',
    status: 'active' as const
  };

  // 임시 역할 - 추후 API나 인증 정보로 대체
  const userRole = 'buyer' as 'seller' | 'buyer';

  const handleBack = () => {
    navigate(-1);
  };

  const handleLeave = () => {
    if (window.confirm('채팅방을 나가시겠습니까?')) {
      navigate('/');
    }
  };

  const handleExtendTime = () => {
    alert('시간 연장 기능 (구현 예정)');
  };

  const handleConfirm = () => {
    alert('모집 확정 기능 (구현 예정)');
  };

  const handleApply = () => {
    alert('구매 신청 기능 (구현 예정)');
  };

  const handleSendMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: `${Date.now()}`,
      type: 'my',
      content: message,
      timestamp: new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <div className="chat-room-page">
      <ChatRoom
        role={userRole}
        productInfo={productInfo}
        recruitmentStatus={recruitmentStatus}
        messages={messages}
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

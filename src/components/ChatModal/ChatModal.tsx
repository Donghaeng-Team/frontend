import { type FC, useState, useEffect } from 'react';
import ChatRoomListModal from '../ChatRoomListModal/ChatRoomListModal';
import ChatRoom from '../ChatRoom';
import type { ChatRoom as ChatRoomType } from '../ChatRoomListModal/ChatRoomListModal';
import type { ChatMessage, ProductInfo, RecruitmentStatus } from '../ChatRoom/ChatRoom';
import './ChatModal.css';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatRooms: ChatRoomType[];
  triggerRef?: React.RefObject<HTMLElement | null>;
  // 특정 채팅방으로 직접 들어갈 때 사용
  initialRoomId?: string;
  initialProductInfo?: ProductInfo;
  initialRecruitmentStatus?: RecruitmentStatus;
  initialRole?: 'seller' | 'buyer';
}

const ChatModal: FC<ChatModalProps> = ({
  isOpen,
  onClose,
  chatRooms,
  triggerRef,
  initialRoomId,
  initialProductInfo,
  initialRecruitmentStatus,
  initialRole = 'buyer'
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(initialRoomId || null);
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

  // 모달 열릴 때 body 스크롤 막기
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // cleanup: 컴포넌트 언마운트 시 스크롤 복원
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRoomClick = (roomId: string) => {
    setSelectedRoomId(roomId);
  };

  const handleBack = () => {
    setSelectedRoomId(null);
  };

  const handleLeave = () => {
    if (window.confirm('채팅방을 나가시겠습니까?')) {
      setSelectedRoomId(null);
    }
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

  // 선택된 채팅방 찾기
  const selectedRoom = selectedRoomId
    ? chatRooms.find(room => room.id === selectedRoomId)
    : null;

  // 상품 정보 (초기값 > 선택된 방 > 기본값)
  const productInfo: ProductInfo = initialProductInfo || (selectedRoom ? {
    name: selectedRoom.productName,
    price: 0, // ChatRoom 타입에 price 정보 없음
    image: selectedRoom.productImage
  } : {
    name: '청송 사과 5kg (특)',
    price: 15000,
    image: undefined
  });

  // 모집 상태 (초기값 > 선택된 방 > 기본값)
  const recruitmentStatus: RecruitmentStatus = initialRecruitmentStatus || (selectedRoom ? {
    current: selectedRoom.participants.current,
    max: selectedRoom.participants.max,
    timeRemaining: '진행 중',
    status: selectedRoom.status
  } : {
    current: 3,
    max: 10,
    timeRemaining: '2시간 30분',
    status: 'active' as const
  });

  return (
    <div className="chat-modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="chat-modal-container">
        {!selectedRoomId ? (
          <ChatRoomListModal
            isOpen={true}
            onClose={onClose}
            chatRooms={chatRooms}
            onRoomClick={handleRoomClick}
            triggerRef={triggerRef}
          />
        ) : (
          <ChatRoom
            role={selectedRoom ? (selectedRoom.creator ? 'seller' : 'buyer') : initialRole}
            productInfo={productInfo}
            recruitmentStatus={recruitmentStatus}
            messages={messages}
            onBack={handleBack}
            onLeave={handleLeave}
            onExtendTime={() => alert('시간 연장 기능 (구현 예정)')}
            onConfirm={() => alert('모집 확정 기능 (구현 예정)')}
            onApply={() => alert('구매 신청 기능 (구현 예정)')}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>
    </div>
  );
};

export default ChatModal;

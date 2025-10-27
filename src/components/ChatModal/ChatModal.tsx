import { type FC, useState, useEffect } from 'react';
import ChatRoomListModal from '../ChatRoomListModal/ChatRoomListModal';
import ChatRoomPage from '../../pages/ChatRoomPage/ChatRoomPage';
import type { ChatRoom as ChatRoomType } from '../ChatRoomListModal/ChatRoomListModal';
import './ChatModal.css';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatRooms: ChatRoomType[];
  triggerRef?: React.RefObject<HTMLElement | null>;
  // 특정 채팅방으로 직접 들어갈 때 사용
  initialRoomId?: string;
}

const ChatModal: FC<ChatModalProps> = ({
  isOpen,
  onClose,
  chatRooms,
  triggerRef,
  initialRoomId
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(initialRoomId || null);

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
          <ChatRoomPage
            roomId={selectedRoomId}
            onBack={handleBack}
            showBottomNav={false}
          />
        )}
      </div>
    </div>
  );
};

export default ChatModal;

import { type FC, useState } from 'react';
import Modal from '../Modal';
import ChatList from '../../pages/ChatList/ChatList';
import ChatRoomPage from '../../pages/ChatRoomPage/ChatRoomPage';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  // 특정 채팅방으로 직접 들어갈 때 사용
  initialRoomId?: string;
}

const ChatModal: FC<ChatModalProps> = ({
  isOpen,
  onClose,
  initialRoomId
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(initialRoomId || null);

  const handleRoomSelect = (roomId: number) => {
    setSelectedRoomId(roomId.toString());
  };

  const handleBack = () => {
    setSelectedRoomId(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="chat-modal">
      {!selectedRoomId ? (
        <ChatList
          onRoomSelect={handleRoomSelect}
          showBottomNav={false}
        />
      ) : (
        <ChatRoomPage
          roomId={selectedRoomId}
          onBack={handleBack}
          showBottomNav={false}
        />
      )}
    </Modal>
  );
};

export default ChatModal;

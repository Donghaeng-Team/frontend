import { type FC, useState, useEffect } from 'react';
import ChatRoomListModal from '../ChatRoomListModal/ChatRoomListModal';
import ChatRoom from '../ChatRoom';
import type { ChatRoom as ChatRoomType } from '../ChatRoomListModal/ChatRoomListModal';
import type { ChatMessage, ProductInfo, RecruitmentStatus } from '../ChatRoom/ChatRoom';
import { chatService } from '../../api/services/chat';
import type { ChatMessageResponse } from '../../types/chat';
import { useAuthStore } from '../../stores/authStore';
import { calculateTimeRemaining } from '../../utils/chatUtils';
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomEndTime, setRoomEndTime] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('진행 중');
  const [isBuyer, setIsBuyer] = useState<boolean>(false);
  const { user: authUser } = useAuthStore();

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

  // 채팅방 선택 시 메시지 로드
  useEffect(() => {
    const loadMessages = async () => {
      // 모달이 닫혀있거나 채팅방이 선택되지 않았으면 스킵
      if (!isOpen || !selectedRoomId || !authUser) {
        if (!selectedRoomId) {
          setMessages([]);
          setIsBuyer(false);
        }
        return;
      }

      try {
        const roomId = parseInt(selectedRoomId);

        // 채팅방 상세 정보와 메시지를 동시에 로드
        const [roomResponse, messagesResponse] = await Promise.all([
          chatService.getChatRoom(roomId),
          chatService.getMessages(roomId, { size: 50 })
        ]);

        const roomInfo = roomResponse.data;
        const creatorUserId = roomInfo?.creatorUserId;

        // 마감 시간 저장
        if (roomInfo?.endTime) {
          setRoomEndTime(roomInfo.endTime);
          setTimeRemaining(calculateTimeRemaining(roomInfo.endTime));
        }

        // 구매자 여부 저장: chatRooms 리스트의 buyer 값을 우선 사용 (더 정확함)
        const currentRoom = chatRooms.find(room => room.id === selectedRoomId);
        const buyerStatus = currentRoom?.buyer ?? roomInfo?.buyer ?? false;
        setIsBuyer(buyerStatus);

        // API 응답을 ChatMessage 형식으로 변환
        const loadedMessages: ChatMessage[] = messagesResponse.data?.messages?.map((msg: ChatMessageResponse) => {
          const isMyMessage = msg.senderId === authUser.userId;
          const isSeller = msg.senderId === creatorUserId;

          // 메시지 타입 결정
          let messageType: ChatMessage['type'];
          if (msg.messageType === 'SYSTEM' || msg.messageType === 'DEADLINE_EXTEND') {
            messageType = 'system';
          } else if (isMyMessage) {
            messageType = 'my';
          } else if (isSeller) {
            messageType = 'seller';
          } else {
            messageType = 'buyer';
          }

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
            sender: messageType !== 'system' ? {
              name: msg.senderNickname,
              isSeller: isSeller
            } : undefined,
            timestamp: new Date(msg.sentAt).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit'
            })
          };
        }) || [];

        setMessages(loadedMessages);
      } catch (error) {
        console.error('메시지 로드 실패:', error);
        // 실패 시 빈 배열 유지
        setMessages([]);
      }
    };

    loadMessages();
  }, [isOpen, selectedRoomId, authUser]);

  // 남은 시간 실시간 업데이트
  useEffect(() => {
    if (!roomEndTime) return;

    // 1분마다 업데이트
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(roomEndTime));
    }, 60000); // 60초

    return () => clearInterval(interval);
  }, [roomEndTime]);

  if (!isOpen) return null;

  const handleRoomClick = (roomId: string) => {
    setSelectedRoomId(roomId);
  };

  const handleBack = () => {
    setSelectedRoomId(null);
  };

  const handleLeave = async () => {
    if (!selectedRoomId) return;

    if (window.confirm('채팅방을 나가시겠습니까?')) {
      try {
        const roomId = parseInt(selectedRoomId);
        await chatService.leaveChatRoom(roomId);
      } catch (error: any) {
        console.log('채팅방 나가기 API 에러 (무시):', error);
        // 500 에러 발생 가능하지만 프론트엔드는 정상 처리
      }

      alert('채팅방에서 나갔습니다.');
      // 모달을 닫아서 채팅방 목록을 새로고침
      onClose();
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

  const handleExtendTime = async () => {
    if (!selectedRoomId) return;

    try {
      const roomId = parseInt(selectedRoomId);
      const response = await chatService.extendDeadline(roomId, 2); // 2시간 연장

      // 연장된 새로운 마감 시간으로 업데이트
      if (response.data?.newDeadline) {
        setRoomEndTime(response.data.newDeadline);
        setTimeRemaining(calculateTimeRemaining(response.data.newDeadline));
      }

      alert('마감 시간이 2시간 연장되었습니다.');
    } catch (error) {
      console.error('시간 연장 실패:', error);
      alert('시간 연장에 실패했습니다.');
    }
  };

  const handleConfirm = async () => {
    if (!selectedRoomId) return;

    if (window.confirm('모집을 확정하시겠습니까?')) {
      try {
        const roomId = parseInt(selectedRoomId);
        await chatService.closeRecruitment(roomId);
        alert('모집이 확정되었습니다.');
      } catch (error) {
        console.error('모집 확정 실패:', error);
        alert('모집 확정에 실패했습니다.');
      }
    }
  };

  const handleApply = async () => {
    if (!selectedRoomId) return;

    if (window.confirm('구매 신청하시겠습니까?')) {
      try {
        const roomId = parseInt(selectedRoomId);
        await chatService.confirmBuyer(roomId);
        setIsBuyer(true);  // 구매자 상태로 변경
        alert('구매 신청이 완료되었습니다.');
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message;

        // "이미 공동구매에 참가 중입니다" 에러는 실제로 구매자라는 뜻
        if (errorMessage === '이미 공동구매에 참가 중입니다') {
          setIsBuyer(true);  // 구매자 상태로 변경
          // 에러 메시지 표시 안함 (버튼만 자동 전환)
        } else {
          console.error('구매 신청 실패:', error);
          alert(`구매 신청에 실패했습니다: ${errorMessage || '알 수 없는 오류'}`);
        }
      }
    }
  };

  const handleCancel = async () => {
    if (!selectedRoomId) return;

    if (window.confirm('구매를 취소하시겠습니까?')) {
      try {
        const roomId = parseInt(selectedRoomId);

        // 구매 취소
        await chatService.cancelBuyer(roomId);

        // 채팅방 나가기 (500 에러가 발생해도 무시)
        try {
          await chatService.leaveChatRoom(roomId);
        } catch (leaveError) {
          console.log('채팅방 나가기 에러 (무시):', leaveError);
          // 백엔드 500 에러 발생 가능하지만 프론트엔드는 정상 처리
        }

        alert('구매가 취소되었습니다.');
        // 모달을 닫아서 채팅방 목록을 새로고침
        onClose();
      } catch (error) {
        console.error('구매 취소 실패:', error);
        alert('구매 취소에 실패했습니다.');
      }
    }
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
    timeRemaining: timeRemaining,  // 실시간 계산된 남은 시간 사용
    status: selectedRoom.status
  } : {
    current: 3,
    max: 10,
    timeRemaining: timeRemaining,
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
            isBuyer={isBuyer}
            onBack={handleBack}
            onLeave={handleLeave}
            onExtendTime={handleExtendTime}
            onConfirm={handleConfirm}
            onApply={handleApply}
            onCancel={handleCancel}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>
    </div>
  );
};

export default ChatModal;

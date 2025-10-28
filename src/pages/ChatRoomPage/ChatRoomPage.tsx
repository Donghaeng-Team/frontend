import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChatRoom from '../../components/ChatRoom';
import BottomNav from '../../components/BottomNav';
import type { ChatMessage } from '../../components/ChatRoom/ChatRoom';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import type { ChatRoomStatus } from '../../types/chat';
import './ChatRoomPage.css';

interface ChatRoomPageProps {
  roomId?: string; // prop으로 받을 수 있음 (모달에서 사용)
  onBack?: () => void; // 모달에서 뒤로가기 핸들러
  showBottomNav?: boolean; // BottomNav 표시 여부 (모달에서는 false)
}

const ChatRoomPage = ({
  roomId: propRoomId,
  onBack: propOnBack,
  showBottomNav = true
}: ChatRoomPageProps) => {
  const navigate = useNavigate();
  const { roomId: paramRoomId } = useParams<{ roomId: string }>();
  const roomId = propRoomId || paramRoomId; // prop 우선, 없으면 URL 파라미터
  const hasJoinedRef = useRef(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('계산 중...');

  const {
    initializeWebSocket,
    disconnectWebSocket,
    wsStatus,
    currentRoom,
    messages,
    participants,
    fetchChatRoom,
    joinChatRoom,
    leaveChatRoom,
    exitChatRoom,
    sendMessage,
    addMessage,
    confirmBuyer,
    cancelBuyer,
    closeRecruitment,
    extendDeadline,
    completePurchase,
  } = useChatStore();
  const { user } = useAuthStore();

  // WebSocket 초기화 (컴포넌트 마운트 시 한 번만 실행)
  useEffect(() => {
    initializeWebSocket();
    return () => {
      disconnectWebSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 배열: 마운트/언마운트 시에만 실행

  // 채팅방 정보 로드 (중복 방지)
  useEffect(() => {
    if (roomId && user && !hasJoinedRef.current) {
      hasJoinedRef.current = true;
      const numericRoomId = parseInt(roomId, 10);
      if (import.meta.env.DEV) {
        console.log('[ChatRoomPage] joinChatRoom 호출:', numericRoomId);
      }
      joinChatRoom(numericRoomId);
    }

    // cleanup: 채팅방 나갈 때 구독 해제
    return () => {
      if (roomId) {
        const numericRoomId = parseInt(roomId, 10);
        leaveChatRoom(numericRoomId);
        hasJoinedRef.current = false;
      }
    };
  }, [roomId, user, joinChatRoom, leaveChatRoom]);

  // 실시간 남은 시간 계산 또는 모집 확정 시간 표시
  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (!currentRoom) {
        setTimeRemaining('정보 없음');
        return;
      }

      // 모집 확정된 경우 확정 시간 표시
      if (currentRoom.status === 'RECRUITMENT_CLOSED' && currentRoom.recruitmentClosedAt) {
        const closedTime = new Date(currentRoom.recruitmentClosedAt);
        const formattedTime = closedTime.toLocaleString('ko-KR', {
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        setTimeRemaining(`${formattedTime} 확정`);
        return;
      }

      if (!currentRoom.endTime) {
        setTimeRemaining('정보 없음');
        return;
      }

      const now = new Date();
      const endTime = new Date(currentRoom.endTime);
      const diffMs = endTime.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeRemaining('마감됨');
        return;
      }

      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        const remainingHours = diffHours % 24;
        setTimeRemaining(`${diffDays}일 ${remainingHours}시간`);
      } else if (diffHours > 0) {
        const remainingMinutes = diffMinutes % 60;
        setTimeRemaining(`${diffHours}시간 ${remainingMinutes}분`);
      } else {
        setTimeRemaining(`${diffMinutes}분`);
      }
    };

    // 초기 계산
    calculateTimeRemaining();

    // 모집 확정 상태가 아닌 경우만 1분마다 업데이트
    if (currentRoom?.status !== 'RECRUITMENT_CLOSED') {
      const intervalId = setInterval(calculateTimeRemaining, 60000);
      return () => clearInterval(intervalId);
    }
  }, [currentRoom?.endTime, currentRoom?.status, currentRoom?.recruitmentClosedAt]);

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
  const formattedMessages: ChatMessage[] = messages
    .filter((msg) => {
      // 방장의 첫 참가 메시지만 필터링 (혼란 방지)
      // currentRoom.creator가 true이고, 본인의 참가 메시지인 경우만 숨김
      if (msg.messageType === 'SYSTEM' &&
          currentRoom?.creator === true &&
          msg.senderId === user?.userId &&
          (msg.messageContent.includes('참가하셨습니다') || msg.messageContent.includes('joined'))) {
        return false;
      }
      return true;
    })
    .map((msg) => {
      const messageType = msg.senderId === user?.userId ? 'my' : msg.messageType === 'SYSTEM' ? 'system' : 'buyer';

      // 시스템 메시지의 경우 'system' 또는 숫자(userId)를 닉네임으로 교체
      let messageContent = msg.messageContent;
      if (messageType === 'system') {
        // senderNickname이 "system"이 아닌 실제 닉네임인 경우만 교체
        if (msg.senderNickname && msg.senderNickname.toLowerCase() !== 'system') {
          // "HyunJun님이 참가하셨습니다" - 이미 닉네임이 포함된 경우는 그대로 사용
          messageContent = msg.messageContent;
        } else {
          // senderNickname이 "system"이거나 없는 경우: 메시지에서 userId 추출 후 닉네임으로 교체
          // "4님이 공동구매 참가를 취소하셨습니다" → userId=4를 찾아서 닉네임으로 교체

          // 메시지 앞부분에서 숫자 추출 (예: "4님이" → 4)
          const userIdMatch = messageContent.match(/^(\d+)님/);

          if (userIdMatch) {
            const extractedUserId = parseInt(userIdMatch[1], 10);

            // 현재 사용자 본인인지 확인
            if (extractedUserId === user?.userId && user?.nickName) {
              messageContent = messageContent.replace(/^\d+님/, `${user.nickName}님`);
            } else {
              // participants에서 닉네임 찾기
              const participant = participants.find(p => p.userId === extractedUserId);
              if (participant?.nickname) {
                messageContent = messageContent.replace(/^\d+님/, `${participant.nickname}님`);
              }
              // 찾지 못하면 userId 그대로 표시
            }
          }
        }
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
    timeRemaining: timeRemaining, // 실시간 계산된 남은 시간
    status: convertChatRoomStatus(currentRoom.status)
  } : {
    current: 0,
    max: 0,
    timeRemaining: '계산 중...',
    status: 'active' as const
  };

  // 사용자 역할 결정: creator면 seller, 아니면 buyer
  // 단, buyer 필드가 true인 경우는 이미 구매자로 확정된 상태
  const userRole = (currentRoom?.creator) ? 'seller' : 'buyer';
  const isBuyer = currentRoom?.buyer ?? false;

  // 디버깅용 로그
  if (import.meta.env.DEV && currentRoom) {
    console.log('[ChatRoomPage] currentRoom:', currentRoom);
    console.log('[ChatRoomPage] user:', user);
    console.log('[ChatRoomPage] creatorUserId:', currentRoom.creatorUserId);
    console.log('[ChatRoomPage] user.userId:', user?.userId);
    console.log('[ChatRoomPage] creator (백엔드):', currentRoom.creator);
    console.log('[ChatRoomPage] buyer (백엔드):', currentRoom.buyer);
    console.log('[ChatRoomPage] → userRole (계산):', userRole);
    console.log('[ChatRoomPage] → isBuyer (계산):', isBuyer);
  }

  const handleBack = () => {
    if (propOnBack) {
      propOnBack(); // 모달에서는 prop 핸들러 사용
    } else {
      navigate(-1); // 페이지에서는 브라우저 히스토리 사용
    }
  };

  const handleLeave = async () => {
    if (window.confirm('채팅방을 나가시겠습니까?')) {
      if (roomId) {
        try {
          await exitChatRoom(parseInt(roomId, 10));
          navigate('/');
        } catch (error: any) {
          console.error('채팅방 나가기 오류:', error);
          // 백엔드 데이터베이스 오류(joined_at null)가 발생하더라도
          // 로컬 상태는 정리하고 홈으로 이동
          if (error?.response?.status === 500) {
            alert('채팅방에서 나갔습니다. (서버 이력 저장 오류 발생)');
            leaveChatRoom(parseInt(roomId, 10)); // 로컬 상태 정리
            navigate('/');
          } else {
            alert('채팅방 나가기에 실패했습니다.');
          }
        }
      }
    }
  };

  const handleExtendTime = async () => {
    if (roomId && currentRoom) {
      try {
        await extendDeadline(parseInt(roomId, 10), 24); // 1일 = 24시간
        // 알림 없이 자동 연장
      } catch (error) {
        console.error('시간 연장 오류:', error);
        alert('시간 연장에 실패했습니다.');
      }
    }
  };

  const handleConfirm = async () => {
    if (roomId && currentRoom) {
      if (window.confirm('모집을 완료하시겠습니까?')) {
        try {
          await closeRecruitment(parseInt(roomId, 10));
          alert('모집이 완료되었습니다.');
        } catch (error) {
          alert('모집 완료에 실패했습니다.');
        }
      }
    }
  };

  const handleApply = async () => {
    if (roomId && currentRoom) {
      try {
        await confirmBuyer(parseInt(roomId, 10));
        alert('구매 신청이 완료되었습니다.');
      } catch (error) {
        alert('구매 신청에 실패했습니다.');
      }
    }
  };

  const handleCancel = async () => {
    if (roomId && currentRoom) {
      if (currentRoom.creator) {
        alert('방장은 구매 취소를 할 수 없습니다.');
        return;
      }
      if (window.confirm('구매를 취소하시겠습니까?')) {
        try {
          await cancelBuyer(parseInt(roomId, 10));
          alert('구매가 취소되었습니다.');
        } catch (error) {
          alert('구매 취소에 실패했습니다.');
        }
      }
    }
  };

  const handleComplete = async () => {
    if (roomId && currentRoom) {
      if (!currentRoom.creator) {
        alert('판매자만 판매 종료를 할 수 있습니다.');
        return;
      }
      if (window.confirm('판매를 종료하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        try {
          await completePurchase(parseInt(roomId, 10));
          alert('판매가 종료되었습니다.');
        } catch (error) {
          alert('판매 종료에 실패했습니다.');
        }
      }
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
        isBuyer={isBuyer}
        productInfo={productInfo}
        recruitmentStatus={recruitmentStatus}
        messages={formattedMessages}
        onBack={handleBack}
        onLeave={handleLeave}
        onExtendTime={handleExtendTime}
        onConfirm={handleConfirm}
        onApply={handleApply}
        onCancel={handleCancel}
        onComplete={handleComplete}
        onSendMessage={handleSendMessage}
      />
      {showBottomNav && <BottomNav />}
    </div>
  );
};

export default ChatRoomPage;

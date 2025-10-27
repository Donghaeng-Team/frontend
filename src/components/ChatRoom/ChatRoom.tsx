import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import Button from '../Button';
import './ChatRoom.css';

export interface ChatMessage {
  id: string;
  type: 'seller' | 'buyer' | 'system' | 'my';
  content: string;
  sender?: {
    name: string;
    avatar?: string;
    isSeller?: boolean;
  };
  timestamp?: string;
}

export interface ProductInfo {
  name: string;
  price: number;
  image?: string;
}

export interface RecruitmentStatus {
  current: number;
  max: number;
  timeRemaining: string;
  status: 'active' | 'closing' | 'closed';
}

interface ChatRoomProps {
  role: 'seller' | 'buyer';
  productInfo: ProductInfo;
  recruitmentStatus: RecruitmentStatus;
  messages: ChatMessage[];
  isBuyer?: boolean;  // 구매 확정 여부
  onBack: () => void;
  onLeave: () => void;
  onExtendTime?: () => void;
  onConfirm?: () => void;
  onApply?: () => void;
  onCancel?: () => void;  // 구매 취소
  onSendMessage: (message: string) => void;
  className?: string;
}

const ChatRoom: FC<ChatRoomProps> = ({
  role,
  productInfo,
  recruitmentStatus,
  messages,
  isBuyer = false,
  onBack,
  onLeave,
  onExtendTime,
  onConfirm,
  onApply,
  onCancel,
  onSendMessage,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 메시지 추가시 스크롤 하단으로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getAvatarColor = (message: ChatMessage) => {
    if (message.sender?.isSeller) return '#ff5e2f';
    if (message.type === 'buyer') return '#3399ff';
    return '#33b233';
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2);
  };

  const formatPrice = (price: number) => {
    return `1인당 ${price.toLocaleString()}원`;
  };

  return (
    <div className={`chat-room ${className}`}>
      {/* Header */}
      <div className="chat-room-header">
        <button className="chat-room-back-btn" onClick={onBack}>
          ← 채팅방
        </button>
      </div>

      {/* Product Info */}
      <div className="chat-room-product-info">
        <div className="chat-room-product-image-wrapper">
          {productInfo.image ? (
            <img
              src={productInfo.image}
              alt={productInfo.name}
              className="chat-room-product-image"
            />
          ) : (
            <div className="chat-room-product-image-placeholder" />
          )}
        </div>
        <div className="chat-room-product-details">
          <h3 className="chat-room-product-name">{productInfo.name}</h3>
          <p className="chat-room-product-price">{formatPrice(productInfo.price)}</p>
        </div>
      </div>

      {/* Recruitment Status */}
      <div className="chat-room-recruitment-status">
        <span className="chat-room-recruitment-count">
          {recruitmentStatus.status === 'closing' || recruitmentStatus.status === 'closed'
            ? `✅ 모집완료 ${recruitmentStatus.current}/${recruitmentStatus.max}명`
            : `🔥 모집중 ${recruitmentStatus.current}/${recruitmentStatus.max}명`}
        </span>
        <span className="chat-room-time-remaining">
          ⏰ {recruitmentStatus.timeRemaining}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="chat-room-actions">
        {role === 'seller' ? (
          <>
            <button
              className="chat-room-action-btn extend-time"
              onClick={onExtendTime}
              disabled={recruitmentStatus.status === 'closing' || recruitmentStatus.status === 'closed'}
            >
              {recruitmentStatus.status === 'closing' || recruitmentStatus.status === 'closed'
                ? '🔒 시간 연장'
                : '⏰ 시간 연장'}
            </button>
            <button
              className="chat-room-action-btn confirm"
              onClick={onConfirm}
              disabled={recruitmentStatus.status === 'closing' || recruitmentStatus.status === 'closed'}
            >
              {recruitmentStatus.status === 'closing' || recruitmentStatus.status === 'closed'
                ? '🔒 모집 확정'
                : '✅ 모집 확정'}
            </button>
          </>
        ) : (
          <>
            {isBuyer ? (
              <button className="chat-room-action-btn cancel" onClick={onCancel}>
                ❌ 구매 취소
              </button>
            ) : (
              <>
                <button 
                  className="chat-room-action-btn apply" 
                  onClick={onApply}
                  disabled={recruitmentStatus.current >= recruitmentStatus.max}
                >
                  {recruitmentStatus.current >= recruitmentStatus.max ? '🔒 모집 마감' : '✅ 구매 신청'}
                </button>
                <button className="chat-room-action-btn leave" onClick={onLeave}>
                  🚪 채팅방 나가기
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* Messages */}
      <div className="chat-room-messages">
        {messages.map((message) => {
          if (message.type === 'system') {
            return (
              <div key={message.id} className="chat-message-system">
                <div className="chat-message-system-content">
                  {message.content}
                </div>
              </div>
            );
          }

          const isMyMessage = message.type === 'my' || (role === 'seller' && message.type === 'seller');
          const showProfile = message.type === 'buyer' || (message.type === 'seller' && role === 'buyer');

          return (
            <div
              key={message.id}
              className={`chat-message ${isMyMessage ? 'chat-message-my' : 'chat-message-other'}`}
            >
              {showProfile && message.sender && (
                <div className="chat-message-profile">
                  <div
                    className="chat-message-avatar"
                    style={{ backgroundColor: getAvatarColor(message) }}
                  >
                    <span className="chat-message-avatar-text">
                      {getInitials(message.sender.name)}
                    </span>
                  </div>
                  <span className="chat-message-sender-name">
                    {message.sender.name}
                    {message.sender.isSeller && ' 👑'}
                  </span>
                </div>
              )}
              <div
                className={`chat-message-bubble ${isMyMessage ? 'chat-message-bubble-my' : 'chat-message-bubble-other'}`}
              >
                {message.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-room-input">
        <input
          ref={inputRef}
          type="text"
          className="chat-room-input-field"
          placeholder="메시지를 입력하세요..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="chat-room-send-btn" onClick={handleSend}>
          전송
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
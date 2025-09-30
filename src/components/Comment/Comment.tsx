import React, { useState } from 'react';
import Avatar from '../Avatar';
import Button from '../Button';
import './Comment.css';

export interface CommentItem {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: Date;
  isOwner?: boolean;
}

interface CommentProps {
  currentUser?: {
    name: string;
    avatar?: string;
  };
  comments?: CommentItem[];
  onAddComment?: (content: string) => void;
  onEditComment?: (id: string, content: string) => void;
  onDeleteComment?: (id: string) => void;
  placeholder?: string;
  className?: string;
}

const Comment: React.FC<CommentProps> = ({
  currentUser = { name: '사용자' },
  comments = [],
  onAddComment,
  onEditComment,
  onDeleteComment,
  placeholder = '댓글을 입력하세요...',
  className = ''
}) => {
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment?.(newComment.trim());
      setNewComment('');
    }
  };

  const handleEdit = (comment: CommentItem) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = (id: string) => {
    if (editContent.trim()) {
      onEditComment?.(id, editContent.trim());
      setEditingId(null);
      setEditContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div className={`comment-section ${className}`}>
      {/* 헤더 */}
      <div className="comment-header">
        <h3 className="comment-title">
          댓글 <span className="comment-count">{comments.length}</span>
        </h3>
      </div>

      {/* 댓글 입력 */}
      <div className="comment-input-container">
        <div className="comment-input-header">
          <Avatar name={currentUser.name} src={currentUser.avatar} size="medium" />
          <span className="comment-input-user">{currentUser.name}</span>
        </div>
        <textarea
          className="comment-textarea"
          placeholder={placeholder}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              handleSubmit();
            }
          }}
        />
        <div className="comment-input-actions">
          <Button 
            variant="primary" 
            size="small"
            onClick={handleSubmit}
            disabled={!newComment.trim()}
          >
            댓글 작성
          </Button>
        </div>
      </div>

      {/* 댓글 목록 */}
      <div className="comment-list">
        {comments.length === 0 ? (
          <div className="comment-empty">
            첫 번째 댓글을 작성해보세요! 👋
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-item-header">
                <Avatar 
                  name={comment.author.name} 
                  src={comment.author.avatar} 
                  size="medium" 
                />
                <div className="comment-item-info">
                  <div className="comment-item-author">{comment.author.name}</div>
                  <div className="comment-item-date">{formatDate(comment.createdAt)}</div>
                </div>
                {comment.isOwner && (
                  <div className="comment-item-actions">
                    <button
                      className="comment-item-btn"
                      onClick={() => handleEdit(comment)}
                    >
                      수정
                    </button>
                    <button
                      className="comment-item-btn comment-item-btn-delete"
                      onClick={() => onDeleteComment?.(comment.id)}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>

              {editingId === comment.id ? (
                <div className="comment-edit-form">
                  <textarea
                    className="comment-edit-textarea"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    autoFocus
                  />
                  <div className="comment-input-actions">
                    <Button 
                      variant="secondary" 
                      size="small"
                      onClick={handleCancelEdit}
                    >
                      취소
                    </Button>
                    <Button 
                      variant="primary" 
                      size="small"
                      onClick={() => handleSaveEdit(comment.id)}
                      disabled={!editContent.trim()}
                    >
                      저장
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="comment-item-content">{comment.content}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comment;
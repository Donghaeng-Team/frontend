import type React from 'react';

// 컴포넌트 관련 타입 정의

// 버튼 관련
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

// 입력 관련
export type InputSize = 'small' | 'medium' | 'large';
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';

// 레이아웃 관련
export interface LayoutProps {
  children: React.ReactNode;
  isLoggedIn?: boolean;
  notificationCount?: number;
}

// 헤더 관련
export interface HeaderProps {
  isLoggedIn?: boolean;
  notificationCount?: number;
  onProfileClick?: () => void;
  onNotificationClick?: () => void;
}

// 모달 관련
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  closeOnBackdrop?: boolean;
}

// 통계 카드 관련
export interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
  icon?: React.ReactNode;
}

// 토글 스위치 관련
export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

// 페이지네이션 관련
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPrevNext?: boolean;
  showFirstLast?: boolean;
}

// 테이블/리스트 관련
export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
}

// 드롭다운/셀렉트 관련
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

// 이미지 업로드 관련
export interface ImageUploadProps {
  maxFiles?: number;
  maxSizePerFile?: number; // bytes
  acceptedTypes?: string[];
  onUpload: (files: File[]) => void;
  onError?: (error: string) => void;
}

// 폼 관련
export interface FormErrors {
  [field: string]: string | undefined;
}

export interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  helpText?: string;
}
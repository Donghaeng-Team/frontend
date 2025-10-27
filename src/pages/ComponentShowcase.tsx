import { useState } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import FormField from '../components/FormField';
import SearchBar from '../components/SearchBar';
import Card from '../components/Card';
import ProductCard from '../components/ProductCard';
import StatCard from '../components/StatCard';
import Checkbox from '../components/Checkbox';
import ToggleSwitch from '../components/ToggleSwitch';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import Dropdown from '../components/Dropdown';
import type { DropdownOption } from '../components/Dropdown';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import Tab from '../components/Tab';
import type { TabItem } from '../components/Tab';
import Slider from '../components/Slider';
import Pagination from '../components/Pagination';
import Skeleton, { SkeletonCard, SkeletonListItem } from '../components/Skeleton';
import Accordion from '../components/Accordion';
import type { AccordionItem } from '../components/Accordion';
import Progress from '../components/Progress';
import CategorySelector from '../components/CategorySelector';
import type { CategoryItem } from '../components/CategorySelector';
import CategoryFilter from '../components/CategoryFilter';
import Breadcrumb, { type BreadcrumbItem } from '../components/Breadcrumb';
import Comment, { type CommentItem } from '../components/Comment';
import DatePicker from '../components/DatePicker';
import Divider from '../components/Divider';
import TimePicker from '../components/TimePicker';
import Rating from '../components/Rating';
import Tooltip from '../components/Tooltip';
import ChatRoom from '../components/ChatRoom';
import './ComponentShowcase.css';

const ComponentShowcase = () => {
  // States
  const [inputValue, setInputValue] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(true);
  const [toggle1, setToggle1] = useState(false);
  const [toggle2, setToggle2] = useState(true);
  const [dropdownValue, setDropdownValue] = useState<string | number>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [activeTab, setActiveTab] = useState('tab1');
  const [sliderValue, setSliderValue] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string[]>(['1']);
  const [progress1, setProgress1] = useState(60);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [rating, setRating] = useState(0);
  const [showChatList, setShowChatList] = useState(false);
  const [showChatRoom, setShowChatRoom] = useState(false);
  const [chatRole, setChatRole] = useState<'seller' | 'buyer'>('buyer');

  // Dropdown options
  const dropdownOptions: DropdownOption[] = [
    { value: '1', label: '옵션 1' },
    { value: '2', label: '옵션 2' },
    { value: '3', label: '옵션 3', disabled: true },
    { value: '4', label: '옵션 4' }
  ];

  // Tab items
  const tabItems: TabItem[] = [
    { key: 'tab1', label: '탭 1', children: <div>탭 1 내용입니다</div> },
    { key: 'tab2', label: '탭 2', children: <div>탭 2 내용입니다</div> },
    { key: 'tab3', label: '탭 3', children: <div>탭 3 내용입니다</div>, disabled: true },
    { key: 'tab4', label: '탭 4', children: <div>탭 4 내용입니다</div> }
  ];

  // Accordion items
  const accordionItems: AccordionItem[] = [
    { 
      key: '1', 
      title: '공동구매란 무엇인가요?',
      content: '공동구매는 여러 사람이 함께 상품을 구매하여 더 저렴한 가격에 구매할 수 있는 서비스입니다.'
    },
    { 
      key: '2', 
      title: '배송은 어떻게 되나요?',
      content: '공동구매 모집이 완료되면 지정된 장소로 배송됩니다. 개별 배송도 가능합니다.'
    },
    { 
      key: '3', 
      title: '환불 정책',
      content: '상품 수령 후 7일 이내 환불 가능합니다.',
      disabled: true
    }
  ];

  const showToastMessage = (type: 'success' | 'error' | 'warning' | 'info') => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const categoryData: CategoryItem[] = [
    {
      value: 'food',
      label: '식품',
      children: [
        {
          value: 'fresh',
          label: '신선식품',
          children: [
            {
              value: 'fruit',
              label: '과일',
              children: [
                { value: 'apple', label: '사과' },
                { value: 'banana', label: '바나나' },
                { value: 'orange', label: '오렌지' }
              ]
            },
            {
              value: 'vegetable',
              label: '채소',
              children: [
                { value: 'lettuce', label: '상추' },
                { value: 'tomato', label: '토마토' }
              ]
            }
          ]
        },
        {
          value: 'processed',
          label: '가공식품',
          children: [
            {
              value: 'snack',
              label: '과자',
              children: [
                { value: 'chips', label: '감자칩' },
                { value: 'cookie', label: '쿠키' }
              ]
            }
          ]
        }
      ]
    },
    {
      value: 'living',
      label: '생활용품',
      children: [
        {
          value: 'kitchen',
          label: '주방용품',
          children: [
            { value: 'dish', label: '그릇' },
            { value: 'pot', label: '냄비' }
          ]
        }
      ]
    }
  ];

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: '홈', href: '/' },
    { label: '카테고리', href: '/category' },
    { label: '식품', href: '/category/food' },
    { label: '과일' }
  ];

  // Comment items
  const commentItems: CommentItem[] = [
    {
      id: '1',
      content: '정말 좋은 상품이네요! 저도 참여하고 싶습니다.',
      author: { name: '김철수', avatar: '' },
      createdAt: new Date('2024-01-15'),
      isOwner: true
    },
    {
      id: '2',
      content: '저도 동감합니다!',
      author: { name: '이영희', avatar: '' },
      createdAt: new Date('2024-01-15'),
      isOwner: false
    },
    {
      id: '3',
      content: '배송은 언제쯤 될까요?',
      author: { name: '박민수', avatar: '' },
      createdAt: new Date('2024-01-14'),
      isOwner: false
    }
  ];

  const sampleChatRooms = [
    {
      id: '1',
      productName: '제주 감귤 10kg 공동구매',
      productImage: '',
      lastMessage: '판매자: 현재 7명 참여중입니다! ...',
      lastMessageTime: '2시간 전',
      unreadCount: 3,
      participants: { current: 7, max: 10 },
      status: 'active' as const,
      creator: true,
      buyer: false
    },
    {
      id: '2',
      productName: '애플 에어팟 프로 공동구매',
      lastMessage: '구매자: 배송은 언제쯤 받을 수...',
      lastMessageTime: '30분 전',
      unreadCount: 1,
      participants: { current: 5, max: 8 },
      status: 'active' as const,
      creator: false,
      buyer: true
    },
    {
      id: '3',
      productName: '스타벅스 텀블러 공동구매',
      lastMessage: '판매자: 마감 임박! 2명만 더 모집...',
      lastMessageTime: '1시간 전',
      participants: { current: 18, max: 20 },
      status: 'closing' as const,
      creator: false,
      buyer: false
    }
  ];

  const sampleMessages = [
    {
      id: '1',
      type: 'seller' as const,
      content: '안녕하세요! 사과 공동구매 방장입니다.\n최소 5명 이상 모이면 진행합니다!',
      sender: { name: '사과조아', isSeller: true }
    },
    {
      id: '2',
      type: 'my' as const,
      content: '참여하고 싶습니다!'
    },
    {
      id: '3',
      type: 'system' as const,
      content: '📢 김민수님이 입장했습니다.'
    },
    {
      id: '4',
      type: 'buyer' as const,
      content: '배송은 언제 받을 수 있나요?',
      sender: { name: '김민수' }
    },
    {
      id: '5',
      type: 'seller' as const,
      content: '모집 확정 후 3일 내 발송 예정입니다!',
      sender: { name: '사과조아', isSeller: true }
    },
    {
      id: '6',
      type: 'my' as const,
      content: '구매 신청합니다!'
    },
    {
      id: '7',
      type: 'system' as const,
      content: '✅ 새싹이님이 구매 신청했습니다.'
    }
  ];

  return (
    <Layout isLoggedIn={true}>
      <div className="showcase-container">
        <h1 className="showcase-title">🛒 함께사요 - 컴포넌트 시스템</h1>

        {/* Buttons */}
        <section className="showcase-section">
          <h2>Buttons</h2>
          <div className="component-grid">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="text">Text</Button>
            <Button variant="kakao" size="large">💬 카카오로 시작하기</Button>
            <Button variant="google" size="large">🔍 구글로 시작하기</Button>
            <Button disabled>Disabled</Button>
            <Button size="small">Small</Button>
            <Button size="large">Large</Button>
          </div>
        </section>

        {/* Inputs */}
        <section className="showcase-section">
          <h2>Inputs</h2>
          <div className="component-grid">
            <Input 
              placeholder="기본 Input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Input placeholder="에러 상태" error="에러 메시지입니다" />
            <Input placeholder="비활성화" disabled />
            <SearchBar 
              placeholder="상품 검색..."
              onSearch={(value) => alert(`검색: ${value}`)}
            />
          </div>
        </section>

        {/* Form Fields */}
        <section className="showcase-section">
          <h2>Form Fields</h2>
          <div style={{ maxWidth: '400px' }}>
            <FormField
              label="이메일"
              name="email"
              type="email"
              placeholder="example@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormField
              label="비밀번호"
              name="password"
              type="password"
              placeholder="8자 이상 입력하세요"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </section>

        {/* Checkbox & Toggle */}
        <section className="showcase-section">
          <h2>Checkbox & Toggle Switch</h2>
          <div className="component-grid">
            <Checkbox 
              label="체크박스 1"
              checked={checked1}
              onChange={setChecked1}
            />
            <Checkbox 
              label="체크박스 2 (체크됨)"
              checked={checked2}
              onChange={setChecked2}
            />
            <Checkbox label="비활성화" disabled />
            <ToggleSwitch 
              checked={toggle1}
              onChange={setToggle1}
              label="알림 설정"
            />
            <ToggleSwitch 
              checked={toggle2}
              onChange={setToggle2}
              label="이메일 수신"
              size="large"
            />
          </div>
        </section>

        {/* Badge & Avatar */}
        <section className="showcase-section">
          <h2>Badge & Avatar</h2>
          <div className="component-grid">
            <Badge count={5}>
              <Avatar name="홍길동" />
            </Badge>
            <Badge count={99}>
              <Avatar name="김철수" />
            </Badge>
            <Badge count={999} max={99}>
              <Button size="small">알림</Button>
            </Badge>
            <Badge dot>
              <Avatar name="이영희" />
            </Badge>
            <Avatar name="박민수" size="large" />
            <Avatar name="사용자" shape="square" />
            <Avatar name="김개발" status="online" />
            <Avatar name="이디자인" status="busy" />
          </div>
        </section>

        {/* Dropdown */}
        <section className="showcase-section">
          <h2>Dropdown</h2>
          <div className="component-grid">
            <Dropdown 
              options={dropdownOptions}
              value={dropdownValue}
              onChange={setDropdownValue}
              placeholder="선택하세요"
            />
            <Dropdown 
              options={dropdownOptions}
              value={dropdownValue}
              onChange={setDropdownValue}
              size="large"
            />
            <Dropdown 
              options={dropdownOptions}
              disabled
              placeholder="비활성화"
            />
          </div>
        </section>

        {/* Tabs */}
        <section className="showcase-section">
          <h2>Tabs</h2>
          <Tab 
            items={tabItems}
            activeKey={activeTab}
            onChange={setActiveTab}
          />
          <br />
          <Tab 
            items={tabItems}
            variant="card"
          />
          <br />
          <Tab 
            items={tabItems}
            variant="pills"
          />
        </section>

        {/* Slider */}
        <section className="showcase-section">
          <h2>Slider - 동네 범위 선택</h2>
          <div style={{ width: '400px' }}>
            <Slider 
              min={0}
              max={3}
              value={sliderValue}
              onChange={setSliderValue}
              defaultValue={0}
              step={1}
              marks={[
                { value: 0, label: '내동네' },
                { value: 1 },  // 라벨 없음 (1km)
                { value: 2 },  // 라벨 없음 (3km)
                { value: 3, label: '먼 동네' }
              ]}
              snapToMarks={true}
              showTooltip={true}
            />
          </div>
        </section>

        {/* Progress */}
        <section className="showcase-section">
          <h2>Progress</h2>
          <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Progress percent={progress1} />
            <Progress percent={100} status="success" />
            <Progress percent={50} status="error" />
            <Progress percent={70} strokeColor="#6633cc" />
            <div style={{ display: 'flex', gap: '20px' }}>
              <Progress percent={75} type="circle" size="small" />
              <Progress percent={85} type="circle" />
              <Progress percent={95} type="circle" size="large" />
            </div>
            <Button onClick={() => setProgress1(Math.min(100, progress1 + 10))}>
              진행률 증가
            </Button>
          </div>
        </section>

        {/* Pagination */}
        <section className="showcase-section">
          <h2>Pagination</h2>
          <Pagination 
            current={currentPage}
            total={123}
            pageSize={10}
            onChange={setCurrentPage}
            showTotal
          />
          <br />
          <Pagination 
            current={currentPage}
            total={500}
            pageSize={20}
            onChange={setCurrentPage}
            showSizeChanger
            showQuickJumper
          />
        </section>

        {/* Skeleton */}
        <section className="showcase-section">
          <h2>Skeleton Loading</h2>
          <div className="component-grid">
            <div style={{ width: '300px' }}>
              <Skeleton />
              <Skeleton />
              <Skeleton width="60%" />
            </div>
            <Skeleton variant="circular" width={60} height={60} />
            <Skeleton variant="rectangular" width={300} height={180} />
          </div>
          <div className="skeleton-grid">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonListItem />
          </div>
        </section>

        {/* Accordion */}
        <section className="showcase-section">
          <h2>Accordion</h2>
          <div style={{ maxWidth: '600px' }}>
            <Accordion 
              items={accordionItems}
              activeKeys={activeAccordion}
              onChange={setActiveAccordion}
            />
            <br />
            <Accordion 
              items={accordionItems}
              accordion
              expandIconPosition="left"
            />
          </div>
        </section>

        {/* Cards */}
        <section className="showcase-section">
          <h2>Cards</h2>
          <div className="card-grid">
            <Card title="기본 카드" subtitle="서브타이틀">
              카드 내용이 들어갑니다.
            </Card>
            <Card variant="elevated" title="Elevated 카드">
              그림자가 있는 카드입니다
            </Card>
            <Card 
              variant="outlined" 
              title="클릭 가능한 카드"
              hoverable
              onClick={() => alert('카드 클릭!')}
            >
              마우스를 올려보세요
            </Card>
          </div>
        </section>

        {/* Stat Cards */}
        <section className="showcase-section">
          <h2>Stat Cards</h2>
          <div className="stat-grid">
            <StatCard label="진행중인 공동구매" value="3" unit="건" color="#ff5e2f" />
            <StatCard label="참여중인 공동구매" value="12" unit="건" color="#3399ff" />
            <StatCard label="완료된 공동구매" value="28" unit="건" color="#6633cc" change={{ value: 15, type: 'increase' }} />
            <StatCard label="좋아요한 상품" value="8" unit="개" color="#ff3333" />
          </div>
        </section>

        {/* Product Cards */}
        <section className="showcase-section">
          <h2>Product Cards</h2>
          <div className="product-grid">
            <ProductCard
              category="식품"
              title="유기농 사과 10kg (부사)"
              price={35000}
              originalPrice={45000}
              discount={22}
              seller={{ name: "사과조아" }}
              participants={{ current: 15, max: 20 }}
              location="서초동"
              status="active"
            />
            <ProductCard
              category="생활용품"
              title="프리미엄 화장지 30롤"
              price={18900}
              seller={{ name: "생활마트" }}
              participants={{ current: 8, max: 10 }}
              location="방배동"
            />
            <ProductCard
              category="육아용품"
              title="기저귀 대형 4박스"
              price={124000}
              seller={{ name: "아기사랑" }}
              participants={{ current: 19, max: 20 }}
              location="역삼동"
            />
          </div>
        </section>

        {/* Modal & Toast Demo */}
        <section className="showcase-section">
          <h2>Modal & Toast</h2>
          <div className="component-grid">
            <Button onClick={() => setIsModalOpen(true)}>Modal 열기</Button>
            <Button variant="secondary" onClick={() => showToastMessage('success')}>
              Toast 표시
            </Button>
          </div>
        </section>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <div style={{ padding: '20px' }}>
            <h2 style={{ marginBottom: '16px' }}>모달 제목</h2>
            <p>모달 내용이 들어갑니다.</p>
            <p>여러 줄의 내용을 넣을 수 있습니다.</p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                취소
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>
                확인
              </Button>
            </div>
          </div>
        </Modal>

        {/* Toast */}
        {showToast && (
          <Toast 
            message="작업이 완료되었습니다!"
            type="success"
            position="top-right"
            onClose={() => setShowToast(false)}
          />
        )}

        {/* Category Selector */}
        <section className="showcase-section">
          <h2>Category Selector - 4단계</h2>
          <CategorySelector 
            data={categoryData}
            maxLevel={4}
            onChange={(values, labels) => {
              console.log('Selected:', values, labels);
            }}
          />
        </section>

        {/* Category Selector - 3단계 */}
        <section className="showcase-section">
          <h2>Category Selector - 3단계</h2>
          <CategorySelector 
            data={categoryData}
            maxLevel={3}
            onChange={(values, labels) => {
              console.log('Selected:', values, labels);
            }}
          />
        </section>

        {/* Category Filter */}
        <section className="showcase-section">
          <h2>Category Filter</h2>
          <CategoryFilter 
            title="카테고리"
            options={[
              { value: 'food', label: '식품', count: 45 },
              { value: 'living', label: '생활용품', count: 32 },
              { value: 'baby', label: '육아용품', count: 28 },
              { value: 'pet', label: '반려동물', count: 15 }
            ]}
            multiple
            showCount
            onChange={(value) => console.log('Selected:', value)}
          />
        </section>

        {/* Breadcrumb */}
        <section className="showcase-section">
          <h2>Breadcrumb</h2>
          <Breadcrumb 
            items={breadcrumbItems}
            onClick={(item, index) => console.log('Clicked:', item, index)}
          />
          <br />
          <Breadcrumb 
            items={breadcrumbItems}
            separator=">"
          />
        </section>

        {/* Divider */}
        <section className="showcase-section">
          <h2>Divider</h2>
          <div style={{ width: '400px' }}>
            <p>위쪽 텍스트</p>
            <Divider />
            <p>아래쪽 텍스트</p>
            <Divider>또는</Divider>
            <p>더 아래쪽 텍스트</p>
            <Divider type="vertical" />
          </div>
        </section>

        {/* Rating */}
        <section className="showcase-section">
          <h2>Rating</h2>
          <div className="component-grid">
            <div>
              <p>인터랙티브 Rating:</p>
              <Rating 
                value={rating}
                onChange={setRating}
                size="large"
              />
            </div>
            <div>
              <p>읽기 전용 Rating:</p>
              <Rating 
                value={4}
                readonly
                size="medium"
              />
            </div>
            <div>
              <p>반별 Rating:</p>
              <Rating 
                value={2.5}
                allowHalf
                readonly
                size="small"
              />
            </div>
          </div>
        </section>

        {/* DatePicker */}
        <section className="showcase-section">
          <h2>DatePicker</h2>
          <div className="component-grid">
            <DatePicker 
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder="날짜를 선택하세요"
            />
            <DatePicker 
              value={selectedDate}
              onChange={setSelectedDate}
              disabled
              placeholder="비활성화"
            />
          </div>
        </section>

        {/* TimePicker */}
        <section className="showcase-section">
          <h2>TimePicker</h2>
          <div className="component-grid">
            <TimePicker 
              value={selectedTime}
              onChange={setSelectedTime}
              placeholder="시간을 선택하세요"
            />
            <TimePicker 
              value={selectedTime}
              onChange={setSelectedTime}
              format="12h"
              placeholder="12시간 형식"
            />
          </div>
        </section>

        {/* Tooltip */}
        <section className="showcase-section">
          <h2>Tooltip</h2>
          <div className="component-grid">
            <Tooltip title="이것은 툴팁입니다" placement="top">
              <Button>Top Tooltip</Button>
            </Tooltip>
            <Tooltip title="오른쪽 툴팁" placement="right">
              <Button>Right Tooltip</Button>
            </Tooltip>
            <Tooltip title="클릭 툴팁" trigger="click">
              <Button>Click Tooltip</Button>
            </Tooltip>
          </div>
        </section>

        {/* Comment */}
        <section className="showcase-section">
          <h2>Comment</h2>
          <div style={{ maxWidth: '600px' }}>
            <Comment 
              comments={commentItems}
              currentUser={{ name: '김철수', avatar: '' }}
              onAddComment={(content) => console.log('Add:', content)}
              onEditComment={(id, content) => console.log('Edit:', id, content)}
              onDeleteComment={(id) => console.log('Delete:', id)}
              placeholder="댓글을 작성해주세요..."
            />
          </div>
        </section>

        {/* 채팅 컴포넌트 섹션 추가 */}
        <section className="showcase-section">
          <h2>Chat Components - 채팅</h2>
          
          <div className="component-grid">
            <Button onClick={() => setShowChatList(true)}>
              채팅방 목록 열기
            </Button>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button 
                variant={chatRole === 'buyer' ? 'primary' : 'secondary'}
                onClick={() => setChatRole('buyer')}
              >
                구매자 뷰
              </Button>
              <Button 
                variant={chatRole === 'seller' ? 'primary' : 'secondary'}
                onClick={() => setChatRole('seller')}
              >
                판매자 뷰
              </Button>
              <Button onClick={() => setShowChatRoom(true)}>
                채팅방 열기
              </Button>
            </div>
          </div>

          {/* 채팅방 목록 모달 기능 제거됨 - ChatList 페이지를 직접 사용하세요 */}

          {/* 채팅방 */}
          {showChatRoom && (
            <div style={{ 
              position: 'fixed', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
            }}>
              <ChatRoom
                role={chatRole}
                productInfo={{
                  name: '[공동구매] 유기농 사과 10kg',
                  price: 12000,
                  image: ''
                }}
                recruitmentStatus={{
                  current: 5,
                  max: 10,
                  timeRemaining: '2시간 30분 남음',
                  status: 'active'
                }}
                messages={sampleMessages}
                onBack={() => {
                  setShowChatRoom(false);
                  setShowChatList(true);
                }}
                onLeave={() => setShowChatRoom(false)}
                onExtendTime={() => alert('시간 연장!')}
                onConfirm={() => alert('모집 확정!')}
                onApply={() => alert('구매 신청!')}
                onSendMessage={(msg) => console.log('Send:', msg)}
              />
            </div>
          )}
          
          {showChatRoom && (
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 999
              }}
              onClick={() => setShowChatRoom(false)}
            />
          )}
        </section>

      </div>
    </Layout>
  );
};

export default ComponentShowcase;
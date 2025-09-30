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
  const [sliderValue, setSliderValue] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string[]>(['1']);
  const [progress1, setProgress1] = useState(60);

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

  return (
    <Layout isLoggedIn={true} notificationCount={3}>
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
            <br />
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              선택된 범위: {
                sliderValue === 0 ? '내동네만' :
                sliderValue === 1 ? '반경 1km' :
                sliderValue === 2 ? '반경 3km' :
                '반경 5km 이상'
              }
            </div>
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
            <StatCard label="찜한 상품" value="8" unit="개" color="#ff3333" />
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
          title="모달 제목"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                취소
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>
                확인
              </Button>
            </>
          }
        >
          <p>모달 내용이 들어갑니다.</p>
          <p>여러 줄의 내용을 넣을 수 있습니다.</p>
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
      </div>
    </Layout>
  );
};

export default ComponentShowcase;
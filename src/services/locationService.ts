import addressesData from '../data/addresses.json';
import type { LocationItem } from '../components/LocationModal/LocationModal';

interface AddressEmd {
  code: string;
  name: string;
}

interface AddressSgg {
  code: string;
  name: string;
  emd: AddressEmd[];
}

interface AddressSido {
  code: string;
  name: string;
  sgg: AddressSgg[];
}

// 타입 단언으로 JSON 데이터 로드
const addresses = addressesData as AddressSido[];

/**
 * 시/도 목록 가져오기
 */
export const fetchSidoList = async (): Promise<LocationItem[]> => {
  // 시뮬레이션을 위한 약간의 지연
  await new Promise(resolve => setTimeout(resolve, 100));

  return addresses.map(sido => ({
    code: sido.code,
    name: sido.name
  }));
};

/**
 * 특정 시/도의 구/군 목록 가져오기
 */
export const fetchGugunList = async (sidoCode: string): Promise<LocationItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));

  const sido = addresses.find(s => s.code === sidoCode);
  if (!sido) {
    return [];
  }

  return sido.sgg.map(sgg => ({
    code: sgg.code,
    name: sgg.name
  }));
};

/**
 * 특정 구/군의 동/읍/면 목록 가져오기
 */
export const fetchDongList = async (sidoCode: string, sggCode: string): Promise<LocationItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));

  const sido = addresses.find(s => s.code === sidoCode);
  if (!sido) {
    return [];
  }

  const sgg = sido.sgg.find(s => s.code === sggCode);
  if (!sgg) {
    return [];
  }

  return sgg.emd.map(emd => ({
    code: emd.code,
    name: emd.name
  }));
};

/**
 * 전체 행정구역 코드 생성
 * @param sidoCode 시/도 코드 (2자리)
 * @param sggCode 구/군 코드 (3자리)
 * @param emdCode 동/읍/면 코드 (3자리)
 * @returns 8자리 행정구역 코드 (예: "11010530")
 */
export const buildDivisionCode = (sidoCode: string, sggCode: string, emdCode: string): string => {
  return `${sidoCode}${sggCode}${emdCode}`;
};

/**
 * Division ID로부터 시/도/구/군/동 정보 추출
 * @param divisionId 8자리 행정구역 코드
 */
export const parseDivisionCode = (divisionId: string) => {
  if (divisionId.length !== 8) {
    throw new Error('Invalid division code length');
  }

  return {
    sidoCode: divisionId.substring(0, 2),
    sggCode: divisionId.substring(2, 5),
    emdCode: divisionId.substring(5, 8)
  };
};

/**
 * Division ID로부터 LocationItem 정보 생성
 */
export const getLocationFromDivisionId = async (divisionId: string): Promise<{
  sido: LocationItem | null;
  gugun: LocationItem | null;
  dong: LocationItem | null;
}> => {
  try {
    const { sidoCode, sggCode, emdCode } = parseDivisionCode(divisionId);

    const sido = addresses.find(s => s.code === sidoCode);
    if (!sido) {
      return { sido: null, gugun: null, dong: null };
    }

    const sgg = sido.sgg.find(s => s.code === sggCode);
    if (!sgg) {
      return {
        sido: { code: sidoCode, name: sido.name },
        gugun: null,
        dong: null
      };
    }

    const emd = sgg.emd.find(e => e.code === emdCode);
    if (!emd) {
      return {
        sido: { code: sidoCode, name: sido.name },
        gugun: { code: sggCode, name: sgg.name },
        dong: null
      };
    }

    return {
      sido: { code: sidoCode, name: sido.name },
      gugun: { code: sggCode, name: sgg.name },
      dong: { code: emdCode, name: emd.name }
    };
  } catch (error) {
    console.error('Error parsing division code:', error);
    return { sido: null, gugun: null, dong: null };
  }
};

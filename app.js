// 전역 변수
let historicalData = null;
let currentTimelineIndex = 0;
let isHistoricalMap = false;

// DOM 요소들
const provinceSelect = document.getElementById('province-select');
const citySelect = document.getElementById('city-select');
const infoPanel = document.getElementById('info-panel');
const regionInfo = document.getElementById('region-info');
const mapModern = document.getElementById('map-modern');
const mapHistorical = document.getElementById('map-historical');
const timeline = document.getElementById('timeline');
const timelinePeriod = document.getElementById('timeline-period');

// 초기화
document.addEventListener('DOMContentLoaded', async function() {
    await loadHistoricalData();
    initializeUI();
    setupEventListeners();
    renderTimeline();
});

// 역사 데이터 로드
async function loadHistoricalData() {
    try {
        const response = await fetch('https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/5f7763e70460ddbb316c525d19782eac/243d6d7f-8acd-4645-9d0a-e01be8dc6542/4e6e6e08.json');
        historicalData = await response.json();
        console.log('역사 데이터 로드 완료:', historicalData);
    } catch (error) {
        console.error('역사 데이터 로드 실패:', error);
        // 데이터 로드 실패 시 대체 데이터 사용
        historicalData = getFallbackData();
    }
}

// 대체 데이터 (네트워크 오류 시)
function getFallbackData() {
    return {
        korea_regions: {
            "서울특별시": ["종로구", "중구", "용산구", "성동구", "광진구", "동대문구", "중랑구", "성북구", "강북구", "도봉구", "노원구", "은평구", "서대문구", "마포구", "양천구", "강서구", "구로구", "금천구", "영등포구", "동작구", "관악구", "서초구", "강남구", "송파구", "강동구"],
            "인천광역시": ["중구", "동구", "미추홀구", "연수구", "남동구", "부평구", "계양구", "서구", "강화군", "옹진군"],
            "경기도": ["수원시", "성남시", "고양시", "용인시", "부천시", "안산시", "안양시", "남양주시", "화성시", "평택시"],
            "강원특별자치도": ["춘천시", "원주시", "강릉시", "동해시", "태백시", "속초시", "삼척시"],
            "충청북도": ["청주시", "충주시", "제천시", "보은군", "옥천군", "영동군"],
            "충청남도": ["천안시", "공주시", "보령시", "아산시", "서산시", "논산시"],
            "전북특별자치도": ["전주시", "군산시", "익산시", "정읍시", "남원시", "김제시"],
            "전라남도": ["목포시", "여수시", "순천시", "나주시", "광양시"],
            "경상북도": ["포항시", "경주시", "김천시", "안동시", "구미시", "영주시"],
            "경상남도": ["창원시", "진주시", "통영시", "사천시", "김해시", "밀양시"],
            "제주특별자치도": ["제주시", "서귀포시"]
        },
        eight_provinces: {
            "경기도": {
                "capital": "한성(서울)",
                "description": "조선의 수도가 있던 중심 지역으로 경복궁, 창덕궁, 창경궁, 덕수궁, 경희궁 등 5대 궁궐이 모두 위치",
                "major_events": ["1392년 조선 건국", "1394년 한양 천도", "1398년 제1차 왕자의 난", "1400년 제2차 왕자의 난"],
                "major_figures": ["태조 이성계 - 조선 건국", "세종대왕 - 한글 창제", "이항복 - 조선 중기 명재상"],
                "cultural_sites": ["경복궁 - 조선 제일의 법궁", "창덕궁 - 세계문화유산", "종묘 - 역대 왕의 위패 봉안"]
            }
        },
        kings: [
            {"order": 1, "name": "태조", "korean_name": "이성계", "reign": "1392-1398", "capital": "개경→한양"},
            {"order": 2, "name": "정종", "korean_name": "이방과", "reign": "1398-1400", "capital": "한양→개경"},
            {"order": 3, "name": "태종", "korean_name": "이방원", "reign": "1400-1418", "capital": "개경→한양"},
            {"order": 4, "name": "세종", "korean_name": "이도", "reign": "1418-1450", "capital": "한양"}
        ]
    };
}

// UI 초기화
function initializeUI() {
    populateProvinceSelect();
    setupMapToggle();
}

// 시도 선택 옵션 채우기
function populateProvinceSelect() {
    if (!historicalData || !historicalData.korea_regions) return;
    
    provinceSelect.innerHTML = '<option value="">시도를 선택하세요</option>';
    
    Object.keys(historicalData.korea_regions).forEach(province => {
        const option = document.createElement('option');
        option.value = province;
        option.textContent = province;
        provinceSelect.appendChild(option);
    });
}

// 시군구 선택 옵션 채우기
function populateCitySelect(province) {
    citySelect.innerHTML = '<option value="">시군구를 선택하세요</option>';
    citySelect.disabled = false;
    
    if (!historicalData || !historicalData.korea_regions || !historicalData.korea_regions[province]) {
        citySelect.disabled = true;
        return;
    }
    
    historicalData.korea_regions[province].forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 시도 선택
    provinceSelect.addEventListener('change', function() {
        const selectedProvince = this.value;
        if (selectedProvince) {
            populateCitySelect(selectedProvince);
            showProvinceInfo(selectedProvince);
            highlightRegion(selectedProvince);
        } else {
            citySelect.innerHTML = '<option value="">먼저 시도를 선택하세요</option>';
            citySelect.disabled = true;
            showWelcomeMessage();
            clearRegionHighlight();
        }
    });

    // 시군구 선택
    citySelect.addEventListener('change', function() {
        const selectedCity = this.value;
        const selectedProvince = provinceSelect.value;
        if (selectedCity && selectedProvince) {
            showCityInfo(selectedProvince, selectedCity);
        }
    });

    // 지도 클릭 이벤트
    document.querySelectorAll('.region-button').forEach(button => {
        button.addEventListener('click', function() {
            const region = this.dataset.region;
            provinceSelect.value = region;
            populateCitySelect(region);
            showProvinceInfo(region);
            highlightRegion(region);
        });
    });

    document.querySelectorAll('.historical-region').forEach(region => {
        region.addEventListener('click', function() {
            const province = this.dataset.province;
            showHistoricalProvinceInfo(province);
            highlightHistoricalRegion(province);
        });
    });

    // 지도 전환 버튼
    document.querySelectorAll('.map-toggle').forEach(button => {
        button.addEventListener('click', function() {
            const mapType = this.dataset.map;
            toggleMap(mapType);
            
            // 버튼 스타일 업데이트
            document.querySelectorAll('.map-toggle').forEach(btn => {
                btn.classList.remove('btn--primary');
                btn.classList.add('btn--outline');
            });
            this.classList.add('btn--primary');
            this.classList.remove('btn--outline');
        });
    });

    // 탭 전환
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            switchTab(tabId);
        });
    });

    // 타임라인 네비게이션
    document.getElementById('timeline-prev').addEventListener('click', () => {
        if (currentTimelineIndex > 0) {
            currentTimelineIndex--;
            renderTimeline();
        }
    });

    document.getElementById('timeline-next').addEventListener('click', () => {
        const maxIndex = Math.ceil(historicalData.kings.length / 6) - 1;
        if (currentTimelineIndex < maxIndex) {
            currentTimelineIndex++;
            renderTimeline();
        }
    });
}

// 지도 전환
function toggleMap(mapType) {
    isHistoricalMap = mapType === 'historical';
    
    if (isHistoricalMap) {
        mapModern.classList.add('hidden');
        mapHistorical.classList.remove('hidden');
    } else {
        mapHistorical.classList.add('hidden');
        mapModern.classList.remove('hidden');
    }
    
    clearRegionHighlight();
    showWelcomeMessage();
}

// 지도 전환 설정
function setupMapToggle() {
    toggleMap('modern');
}

// 탭 전환
function switchTab(tabId) {
    // 모든 탭 버튼 비활성화
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // 모든 탭 패널 숨기기
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // 선택된 탭 활성화
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}-panel`).classList.add('active');
}

// 환영 메시지 표시
function showWelcomeMessage() {
    infoPanel.classList.remove('hidden');
    regionInfo.classList.add('hidden');
}

// 시도 정보 표시
function showProvinceInfo(province) {
    infoPanel.classList.add('hidden');
    regionInfo.classList.remove('hidden');
    
    document.getElementById('region-title').textContent = province;
    document.getElementById('region-meta').textContent = '조선시대 행정구역 정보';
    
    // 조선시대 8도 매핑
    const historicalProvince = getHistoricalProvince(province);
    if (historicalProvince && historicalData.eight_provinces && historicalData.eight_provinces[historicalProvince]) {
        const data = historicalData.eight_provinces[historicalProvince];
        displayRegionData(data);
    } else {
        displayDefaultProvinceInfo(province);
    }
}

// 시군구 정보 표시
function showCityInfo(province, city) {
    infoPanel.classList.add('hidden');
    regionInfo.classList.remove('hidden');
    
    document.getElementById('region-title').textContent = `${province} ${city}`;
    document.getElementById('region-meta').textContent = '조선시대 지역 정보';
    
    if (historicalData.city_history && historicalData.city_history[province] && historicalData.city_history[province][city]) {
        const data = historicalData.city_history[province][city];
        displayCityData(data);
    } else if (historicalData.city_history && historicalData.city_history[city]) {
        const data = historicalData.city_history[city];
        displayCityData(data);
    } else {
        displayDefaultCityInfo(province, city);
    }
}

// 조선시대 8도 정보 표시
function showHistoricalProvinceInfo(province) {
    infoPanel.classList.add('hidden');
    regionInfo.classList.remove('hidden');
    
    document.getElementById('region-title').textContent = province;
    document.getElementById('region-meta').textContent = '조선시대 8도';
    
    if (historicalData.eight_provinces && historicalData.eight_provinces[province]) {
        const data = historicalData.eight_provinces[province];
        displayRegionData(data);
    }
}

// 현대 시도를 조선시대 8도로 매핑
function getHistoricalProvince(modernProvince) {
    const mapping = {
        '서울특별시': '경기도',
        '인천광역시': '경기도',
        '경기도': '경기도',
        '강원특별자치도': '강원도',
        '충청북도': '충청도',
        '충청남도': '충청도',
        '대전광역시': '충청도',
        '세종특별자치시': '충청도',
        '전북특별자치도': '전라도',
        '전라남도': '전라도',
        '광주광역시': '전라도',
        '경상북도': '경상도',
        '경상남도': '경상도',
        '대구광역시': '경상도',
        '부산광역시': '경상도',
        '울산광역시': '경상도',
        '제주특별자치도': '전라도'
    };
    return mapping[modernProvince];
}

// 지역 데이터 표시
function displayRegionData(data) {
    // 개요
    document.getElementById('region-description').innerHTML = `
        <h4>역사적 개요</h4>
        <p>${data.description}</p>
        ${data.capital ? `<p><strong>중심지:</strong> ${data.capital}</p>` : ''}
    `;
    
    // 역사적 사건
    document.getElementById('region-events').innerHTML = `
        <h4>주요 역사적 사건</h4>
        <ul class="event-list">
            ${data.major_events ? data.major_events.map(event => `
                <li class="event-item">
                    <div class="event-title">${event}</div>
                </li>
            `).join('') : '<li>정보가 없습니다.</li>'}
        </ul>
    `;
    
    // 역사적 인물
    document.getElementById('region-figures').innerHTML = `
        <h4>주요 역사적 인물</h4>
        <ul class="figure-list">
            ${data.major_figures ? data.major_figures.map(figure => `
                <li class="figure-item">
                    <div class="figure-name">${figure}</div>
                </li>
            `).join('') : '<li>정보가 없습니다.</li>'}
        </ul>
    `;
    
    // 문화유적지
    document.getElementById('region-sites').innerHTML = `
        <h4>주요 문화유적지</h4>
        <ul class="site-list">
            ${data.cultural_sites ? data.cultural_sites.map(site => `
                <li class="site-item">
                    <div class="site-name">${site}</div>
                </li>
            `).join('') : '<li>정보가 없습니다.</li>'}
        </ul>
    `;
}

// 도시 데이터 표시
function displayCityData(data) {
    // 개요
    document.getElementById('region-description').innerHTML = `
        <h4>역사적 개요</h4>
        <p>${data.history || '조선시대 중요한 지역 중 하나입니다.'}</p>
    `;
    
    // 역사적 사건 (전체 역사 이벤트에서 관련된 것들 찾기)
    const relatedEvents = getRelatedEvents(data);
    document.getElementById('region-events').innerHTML = `
        <h4>관련 역사적 사건</h4>
        <ul class="event-list">
            ${relatedEvents.length > 0 ? relatedEvents.map(event => `
                <li class="event-item">
                    <span class="event-year">${event.year}년</span>
                    <div class="event-title">${event.event}</div>
                    <p class="event-description">왕: ${event.king} | 장소: ${event.location}</p>
                </li>
            `).join('') : '<li>기록된 주요 사건이 없습니다.</li>'}
        </ul>
    `;
    
    // 역사적 인물
    document.getElementById('region-figures').innerHTML = `
        <h4>주요 역사적 인물</h4>
        <ul class="figure-list">
            ${data.figures ? data.figures.map(figure => `
                <li class="figure-item">
                    <div class="figure-name">${figure}</div>
                </li>
            `).join('') : '<li>기록된 주요 인물이 없습니다.</li>'}
        </ul>
    `;
    
    // 문화유적지
    document.getElementById('region-sites').innerHTML = `
        <h4>주요 문화유적지</h4>
        <ul class="site-list">
            ${data.sites ? data.sites.map(site => `
                <li class="site-item">
                    <div class="site-name">${site}</div>
                </li>
            `).join('') : '<li>기록된 주요 유적지가 없습니다.</li>'}
        </ul>
    `;
}

// 기본 시도 정보 표시
function displayDefaultProvinceInfo(province) {
    document.getElementById('region-description').innerHTML = `
        <h4>역사적 개요</h4>
        <p>${province}는 조선시대 중요한 행정구역 중 하나였습니다.</p>
    `;
    
    document.getElementById('region-events').innerHTML = `
        <h4>주요 역사적 사건</h4>
        <p>관련 역사적 사건 정보를 준비 중입니다.</p>
    `;
    
    document.getElementById('region-figures').innerHTML = `
        <h4>주요 역사적 인물</h4>
        <p>관련 역사적 인물 정보를 준비 중입니다.</p>
    `;
    
    document.getElementById('region-sites').innerHTML = `
        <h4>주요 문화유적지</h4>
        <p>관련 문화유적지 정보를 준비 중입니다.</p>
    `;
}

// 기본 시군구 정보 표시
function displayDefaultCityInfo(province, city) {
    document.getElementById('region-description').innerHTML = `
        <h4>역사적 개요</h4>
        <p>${province} ${city}는 조선시대 지역사에서 중요한 역할을 했습니다.</p>
    `;
    
    document.getElementById('region-events').innerHTML = `
        <h4>주요 역사적 사건</h4>
        <p>관련 역사적 사건 정보를 준비 중입니다.</p>
    `;
    
    document.getElementById('region-figures').innerHTML = `
        <h4>주요 역사적 인물</h4>
        <p>관련 역사적 인물 정보를 준비 중입니다.</p>
    `;
    
    document.getElementById('region-sites').innerHTML = `
        <h4>주요 문화유적지</h4>
        <p>관련 문화유적지 정보를 준비 중입니다.</p>
    `;
}

// 관련 역사적 사건 찾기
function getRelatedEvents(data) {
    if (!historicalData.historical_events) return [];
    
    return historicalData.historical_events.filter(event => {
        // 데이터에 관련 정보가 있는지 확인
        return data.history && data.history.includes(event.event.substring(5));
    }).slice(0, 5); // 최대 5개만 표시
}

// 지역 하이라이트
function highlightRegion(region) {
    clearRegionHighlight();
    const regionButton = document.querySelector(`[data-region="${region}"]`);
    if (regionButton) {
        regionButton.classList.add('selected');
    }
}

function highlightHistoricalRegion(province) {
    clearRegionHighlight();
    const regionElement = document.querySelector(`[data-province="${province}"]`);
    if (regionElement) {
        regionElement.classList.add('selected');
    }
}

function clearRegionHighlight() {
    document.querySelectorAll('.region-button, .historical-region').forEach(element => {
        element.classList.remove('selected');
    });
}

// 타임라인 렌더링
function renderTimeline() {
    if (!historicalData || !historicalData.kings) return;
    
    const kingsPerPage = 6;
    const startIndex = currentTimelineIndex * kingsPerPage;
    const endIndex = Math.min(startIndex + kingsPerPage, historicalData.kings.length);
    const kingsToShow = historicalData.kings.slice(startIndex, endIndex);
    
    timeline.innerHTML = '';
    
    kingsToShow.forEach(king => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        
        // 해당 왕 시대의 주요 사건 찾기
        const kingEvents = getKingEvents(king.name);
        
        timelineItem.innerHTML = `
            <div class="timeline-king" title="${king.korean_name} (${king.name})">
                ${king.name}
            </div>
            <div class="timeline-reign">${king.reign}</div>
            <div class="timeline-events">
                ${kingEvents.slice(0, 2).map(event => event.event).join(', ')}
            </div>
        `;
        
        timeline.appendChild(timelineItem);
    });
    
    // 시간 범위 업데이트
    if (kingsToShow.length > 0) {
        const startYear = kingsToShow[0].reign.split('-')[0];
        const endYear = kingsToShow[kingsToShow.length - 1].reign.split('-')[1];
        timelinePeriod.textContent = `${startYear}년 - ${endYear}년`;
    }
    
    // 네비게이션 버튼 상태 업데이트
    const prevButton = document.getElementById('timeline-prev');
    const nextButton = document.getElementById('timeline-next');
    const maxIndex = Math.ceil(historicalData.kings.length / kingsPerPage) - 1;
    
    prevButton.disabled = currentTimelineIndex === 0;
    nextButton.disabled = currentTimelineIndex === maxIndex;
}

// 특정 왕 시대의 사건들 찾기
function getKingEvents(kingName) {
    if (!historicalData.historical_events) return [];
    
    return historicalData.historical_events.filter(event => event.king === kingName);
}

// 페이지 로드 시 실행
window.addEventListener('load', function() {
    // 추가적인 초기화 작업이 있다면 여기에
    console.log('조선시대 역사 탐험 웹앱이 로드되었습니다.');
});
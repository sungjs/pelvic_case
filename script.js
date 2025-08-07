document.addEventListener('DOMContentLoaded', async () => {
    // HTML 요소들
    const viewerA = document.getElementById('viewer-a');
    const viewerB = document.getElementById('viewer-b');
    const panelA = document.getElementById('panel-a');
    const panelB = document.getElementById('panel-b');
    const slider = document.getElementById('slice-slider');
    const currentSliceEl = document.getElementById('current-slice');
    const totalSlicesEl = document.getElementById('total-slices');
    const buttonsContainer = document.getElementById('case-buttons-container');

    let currentCaseData = null; // 현재 선택된 케이스의 이미지 경로들
    let currentIndex = 0; // 현재 보여주고 있는 이미지의 인덱스

    // 특정 인덱스의 이미지를 뷰어에 표시하는 함수
    const showSlice = (index) => {
        if (!currentCaseData) return;

        // 인덱스가 범위를 벗어나지 않도록 제한
        const newIndex = Math.max(0, Math.min(index, currentCaseData.auto_images.length - 1));

        // 뷰어의 이미지 소스(src)를 업데이트
        viewerA.src = currentCaseData.auto_images[newIndex];
        viewerB.src = currentCaseData.manual_images[newIndex];
        
        // 슬라이더와 텍스트 정보 업데이트
        slider.value = newIndex;
        currentSliceEl.textContent = newIndex + 1;
        currentIndex = newIndex;
    };

    // 케이스를 선택했을 때 호출되는 함수
    const loadCase = (caseData) => {
        currentCaseData = caseData;
        const totalImages = caseData.auto_images.length;
        
        // 슬라이더 설정 업데이트
        slider.max = totalImages - 1;
        slider.value = 0;
        
        // 텍스트 정보 업데이트
        totalSlicesEl.textContent = totalImages;
        
        // 첫 번째 이미지 표시
        showSlice(0);
    };

    // 슬라이더를 움직였을 때
    slider.addEventListener('input', (e) => {
        showSlice(parseInt(e.target.value, 10));
    });

    // 마우스 휠을 굴렸을 때
    const handleWheel = (e) => {
        e.preventDefault(); // 페이지 전체 스크롤 방지
        if (e.deltaY < 0) { // 휠을 위로
            showSlice(currentIndex - 1);
        } else { // 휠을 아래로
            showSlice(currentIndex + 1);
        }
    };
    panelA.addEventListener('wheel', handleWheel);
    panelB.addEventListener('wheel', handleWheel);

    // --- 시작: json 데이터로 버튼 생성 (이전과 동일) ---
    try {
        const response = await fetch('images.json');
        const data = await response.json();
        
        data.cases.forEach(caseData => {
            const button = document.createElement('button');
            const caseNumber = parseInt(caseData.prefix, 10);
            button.textContent = `Case ${caseNumber}`;
            
            button.addEventListener('click', () => {
                loadCase(caseData); // 케이스 로드
                document.querySelectorAll('#case-buttons-container button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
            
            buttonsContainer.appendChild(button);
        });

        // 페이지 로드 시 첫 번째 케이스를 자동으로 불러오기
        if (data.cases.length > 0) {
            loadCase(data.cases[0]);
            buttonsContainer.querySelector('button').classList.add('active');
        }

    } catch (error) {
        console.error("images.json 파일을 불러오거나 처리하는 데 실패했습니다:", error);
    }
});
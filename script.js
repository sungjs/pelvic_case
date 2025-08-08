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
    const legendImage = document.getElementById('legend-image'); // 범례 이미지 요소 추가

    let currentCaseData = null;
    let currentIndex = 0;

    const showSlice = (index) => {
        if (!currentCaseData) return;
        const newIndex = Math.max(0, Math.min(index, currentCaseData.auto_images.length - 1));
        viewerA.src = currentCaseData.auto_images[newIndex];
        viewerB.src = currentCaseData.manual_images[newIndex];
        slider.value = newIndex;
        currentSliceEl.textContent = newIndex + 1;
        currentIndex = newIndex;
    };

    // 케이스를 선택했을 때 호출되는 함수
    const loadCase = (caseData) => {
        currentCaseData = caseData;
        const totalImages = caseData.auto_images.length;
        
        slider.max = totalImages - 1;
        slider.value = 0;
        totalSlicesEl.textContent = totalImages;

        // --- 범례 이미지 업데이트 로직 추가 ---
        const caseNumber = parseInt(caseData.prefix, 10);
        legendImage.src = `structure_colors/case${caseNumber}.jpg`; // 범례 이미지 경로 설정
        
        showSlice(0);
    };

    slider.addEventListener('input', (e) => showSlice(parseInt(e.target.value, 10)));

    const handleWheel = (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            showSlice(currentIndex - 1);
        } else {
            showSlice(currentIndex + 1);
        }
    };
    panelA.addEventListener('wheel', handleWheel);
    panelB.addEventListener('wheel', handleWheel);

    try {
        const response = await fetch('images.json');
        const data = await response.json();
        
        data.cases.forEach(caseData => {
            const button = document.createElement('button');
            const caseNumber = parseInt(caseData.prefix, 10);
            button.textContent = `Case ${caseNumber}`;
            
            button.addEventListener('click', () => {
                loadCase(caseData);
                document.querySelectorAll('#case-buttons-container button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
            
            buttonsContainer.appendChild(button);
        });

        if (data.cases.length > 0) {
            loadCase(data.cases[0]);
            buttonsContainer.querySelector('button').classList.add('active');
        }
    } catch (error) {
        console.error("images.json 파일을 불러오거나 처리하는 데 실패했습니다:", error);
    }
});
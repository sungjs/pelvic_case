document.addEventListener('DOMContentLoaded', async () => {
    // HTML 요소들을 가져옵니다.
    const contentA = document.getElementById('content-a');
    const contentB = document.getElementById('content-b');
    const syncCheckbox = document.getElementById('sync-scroll');
    const buttonsContainer = document.getElementById('case-buttons-container');

    // 이미지를 화면에 표시하는 함수 (이전과 동일)
    const displayImages = (caseData) => {
        contentA.innerHTML = '';
        contentB.innerHTML = '';

        caseData.auto_images.forEach(imgPath => {
            const img = document.createElement('img');
            img.src = imgPath;
            contentA.appendChild(img);
        });

        caseData.manual_images.forEach(imgPath => {
            const img = document.createElement('img');
            img.src = imgPath;
            contentB.appendChild(img);
        });
    };

    // --- 핵심 로직: json 데이터를 기반으로 버튼을 생성하고 이벤트를 연결합니다 ---
    try {
        const response = await fetch('images.json');
        const data = await response.json();
        const allCasesData = data.cases;

        if (!allCasesData || allCasesData.length === 0) {
            buttonsContainer.textContent = "표시할 케이스가 없습니다.";
            return;
        }

        // 각 케이스 데이터에 대해 버튼을 생성합니다.
        allCasesData.forEach(caseData => {
            const button = document.createElement('button');
            // 'Case 001'에서 숫자만 추출하여 'Case 1'과 같이 깔끔하게 표시
            const caseNumber = parseInt(caseData.prefix, 10);
            button.textContent = `Case ${caseNumber}`;
            
            // 버튼 클릭 이벤트 리스너 추가
            button.addEventListener('click', () => {
                // 클릭된 케이스의 이미지를 표시
                displayImages(caseData);
                
                // 현재 활성화된 버튼을 시각적으로 표시 (선택사항)
                document.querySelectorAll('#case-buttons-container button').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
            });
            
            // 생성된 버튼을 컨테이너에 추가
            buttonsContainer.appendChild(button);
        });

    } catch (error) {
        console.error("images.json 파일을 불러오거나 처리하는 데 실패했습니다:", error);
        alert("이미지 데이터를 불러올 수 없습니다. 콘솔을 확인해주세요.");
    }
    
    // --- 스크롤 동기화 로직 (이전과 동일) ---
    let isSyncing = false;
    const syncScroll = (source, target) => {
        if (syncCheckbox.checked && !isSyncing) {
            isSyncing = true;
            target.scrollTop = source.scrollTop;
        }
        requestAnimationFrame(() => { isSyncing = false; });
    };
    contentA.addEventListener('scroll', () => syncScroll(contentA, contentB));
    contentB.addEventListener('scroll', () => syncScroll(contentB, contentA));
});
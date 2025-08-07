document.addEventListener('DOMContentLoaded', () => {
    // 각 패널의 요소들 가져오기
    const fileInputA = document.getElementById('file-input-a');
    const contentA = document.getElementById('content-a');
    const fileInputB = document.getElementById('file-input-b');
    const contentB = document.getElementById('content-b');
    const syncCheckbox = document.getElementById('sync-scroll');

    // 파일 선택 시 이미지를 패널에 표시하는 함수
    const handleFiles = (files, contentElement) => {
        contentElement.innerHTML = ''; // 기존 내용 삭제
        
        // 파일 이름을 기준으로 정렬
        const sortedFiles = Array.from(files).sort((a, b) => a.name.localeCompare(b.name));
        
        sortedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                contentElement.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    };

    // 파일 입력(input)에 이벤트 리스너 연결
    fileInputA.addEventListener('change', (e) => handleFiles(e.target.files, contentA));
    fileInputB.addEventListener('change', (e) => handleFiles(e.target.files, contentB));

    // --- 스크롤 동기화 로직 ---
    let isSyncing = false; // 무한 루프 방지를 위한 플래그

    const syncScroll = (source, target) => {
        // 동기화가 체크되어 있고, 현재 동기화 동작 중이 아니라면
        if (syncCheckbox.checked && !isSyncing) {
            isSyncing = true; // 동기화 시작을 알림
            target.scrollTop = source.scrollTop;
        }
        
        // 아주 짧은 시간 뒤에 플래그를 해제하여 다음 사용자 입력에 반응하도록 함
        requestAnimationFrame(() => {
            isSyncing = false;
        });
    };

    contentA.addEventListener('scroll', () => syncScroll(contentA, contentB));
    contentB.addEventListener('scroll', () => syncScroll(contentB, contentA));
});
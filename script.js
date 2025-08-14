// script.js (Case 번호 → Question 번호 순 드롭다운, 'Case 1 — Q1' 형식)

document.addEventListener('DOMContentLoaded', async () => {
  // ===== Element Handles =====
  const viewerA = document.getElementById('viewer-a');
  const viewerB = document.getElementById('viewer-b');
  const panelA  = document.getElementById('panel-a');
  const panelB  = document.getElementById('panel-b');
  const titleA  = document.getElementById('title-a');
  const titleB  = document.getElementById('title-b');

  const slider  = document.getElementById('slice-slider');
  const currentSliceEl = document.getElementById('current-slice');
  const totalSlicesEl  = document.getElementById('total-slices');

  const legendImage    = document.getElementById('legend-image');
  const questionIndicator = document.getElementById('question-indicator');
  const questionTitleEl   = document.getElementById('question-title');

  const prevBtn = document.getElementById('prev-question-btn');
  const nextBtn = document.getElementById('next-question-btn');
  const jumpSelect = document.getElementById('question-jump');

  // ===== App State =====
  let allCasesData = null;     
  let surveyQuestions = [];    
  let currentQuestionIndex = 0;
  let currentSliceIndex    = 0;

  let imagesA = null; 
  let imagesB = null; 

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, hi));

  async function preloadImages(imageUrls) {
    const promises = imageUrls.map(url => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = () => {
          console.error(`Failed to preload image: ${url}`);
          resolve(null);
        };
      });
    });
    return Promise.all(promises);
  }

  function setPanelDefaults() {
    panelA.classList.remove('hidden');
    panelB.classList.remove('hidden');
    panelA.style.flex = '5';
    panelB.style.flex = '5';

    titleA.textContent = 'Contour A';
    titleB.textContent = 'Contour B';

    viewerA.removeAttribute('src');
    viewerB.removeAttribute('src');
    viewerB.style.display = '';
  }

  function setSingleLeftLayout() {
    panelB.classList.add('hidden');
    panelA.style.flex = '10';
    titleA.textContent = 'Contour';
  }

  function setDualLayout() {
    panelA.classList.remove('hidden');
    panelB.classList.remove('hidden');
    panelA.style.flex = '5';
    panelB.style.flex = '5';
    titleA.textContent = 'Contour A';
    titleB.textContent = 'Contour B';
  }

  async function loadSurveyData() {
    const raw = await fetch('survey_data.txt').then(r => r.text());
    const text = raw.replace(/^\uFEFF/, '');
    surveyQuestions = text
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#'))
      .map((line, idx) => {
        const [q, caseNo, order] = line.split('|').map(s => (s || '').trim());
        return {
          questionNumber: Number(q || (idx + 1)),
          caseNumber: Number(caseNo),
          order: (order || 'AM').toUpperCase()
        };
      });
  }

  async function loadImagesJson() {
    allCasesData = await fetch('images.json').then(r => r.json());
    if (!allCasesData || !Array.isArray(allCasesData.cases)) {
      throw new Error('Invalid images.json structure');
    }
  }

  function getCaseDataByNumber(caseNumber) {
    const prefix = String(caseNumber).padStart(3, '0');
    return allCasesData.cases.find(c => c.prefix === prefix);
  }

  // ★ 수정된 부분: Case → Question 순서로 정렬, 'Case 1 — Q1' 형식
  function populateJumpDropdown() {
    if (!jumpSelect) return;
    jumpSelect.innerHTML = '';

    const sortedQuestions = [...surveyQuestions].sort((a, b) => {
      if (a.caseNumber !== b.caseNumber) {
        return a.caseNumber - b.caseNumber;
      }
      return a.questionNumber - b.questionNumber;
    });

    sortedQuestions.forEach(q => {
      const opt = document.createElement('option');
      opt.value = String(surveyQuestions.indexOf(q));
      opt.textContent = `Case ${q.caseNumber} — Q${q.questionNumber}`;
      jumpSelect.appendChild(opt);
    });
  }

  async function loadQuestion(qIndex) {
    if (!surveyQuestions.length || !allCasesData?.cases?.length) return;

    currentQuestionIndex = clamp(qIndex, 0, surveyQuestions.length - 1);
    const info = surveyQuestions[currentQuestionIndex];
    const caseData = getCaseDataByNumber(info.caseNumber);

    questionIndicator.textContent = `Question ${info.questionNumber} / ${surveyQuestions.length}`;
    questionTitleEl.textContent   = `Case ${info.caseNumber}`;

    if (legendImage) {
      legendImage.style.display = '';
      legendImage.onerror = () => { legendImage.style.display = 'none'; };
      if (caseData?.prefix) {
        legendImage.src = `structure_colors/case${caseData.prefix}.jpg`;
      } else {
        legendImage.style.display = 'none';
      }
    }

    setPanelDefaults();

    if (!caseData) {
      console.error(`Case ${info.caseNumber} not found in images.json`);
      imagesA = null;
      imagesB = null;
      slider.max = 0;
      slider.value = 0;
      currentSliceIndex = 0;
      currentSliceEl.textContent = '0';
      totalSlicesEl.textContent  = '0';
      if (jumpSelect) jumpSelect.value = String(currentQuestionIndex);
      return;
    }

    const auto   = caseData.auto_images || [];
    const manual = caseData.manual_images || [];

    switch (info.order) {
      case 'A':
        imagesA = auto;
        imagesB = null;
        setSingleLeftLayout();
        break;
      case 'M':
        imagesA = manual;
        imagesB = null;
        setSingleLeftLayout();
        break;
      case 'AM':
        imagesA = auto;
        imagesB = manual;
        setDualLayout();
        break;
      case 'MA':
        imagesA = manual;
        imagesB = auto;
        setDualLayout();
        break;
      default:
        imagesA = auto;
        imagesB = manual;
        setDualLayout();
    }

    const lenA = imagesA?.length ?? 0;
    const lenB = imagesB?.length ?? 0;
    const total = imagesB ? Math.min(lenA, lenB) : lenA;

    slider.max = Math.max(total - 1, 0);
    slider.value = 0;
    currentSliceIndex = 0;

    currentSliceEl.textContent = total ? '1' : '0';
    totalSlicesEl.textContent  = String(total);
    
    let allImageUrls = [];
    if (imagesA) allImageUrls = allImageUrls.concat(imagesA);
    if (imagesB) allImageUrls = allImageUrls.concat(imagesB);
    
    await preloadImages(allImageUrls);
    
    showSlice(0);

    if (jumpSelect) jumpSelect.value = String(currentQuestionIndex);
  }

  function showSlice(index) {
    if (!imagesA) return;

    const lenA = imagesA.length;
    const total = imagesB ? Math.min(lenA, imagesB.length) : lenA;
    if (total <= 0) {
      viewerA.removeAttribute('src');
      viewerB.removeAttribute('src');
      viewerB.style.display = imagesB ? '' : 'none';
      return;
    }

    currentSliceIndex = clamp(index, 0, total - 1);

    slider.value = currentSliceIndex;
    currentSliceEl.textContent = String(currentSliceIndex + 1);

    viewerA.src = imagesA[currentSliceIndex];
    if (imagesB) {
      viewerB.src = imagesB[currentSliceIndex];
      viewerB.style.display = '';
    } else {
      viewerB.removeAttribute('src');
      viewerB.style.display = 'none';
    }
  }

  slider.addEventListener('input', e => {
    const idx = parseInt(e.target.value, 10) || 0;
    showSlice(idx);
  });

  const onWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? -1 : 1;
    showSlice(currentSliceIndex + delta);
  };
  panelA.addEventListener('wheel', onWheel, { passive: false });
  panelB.addEventListener('wheel', onWheel, { passive: false });

  prevBtn.addEventListener('click', () => loadQuestion(currentQuestionIndex - 1));
  nextBtn.addEventListener('click', () => loadQuestion(currentQuestionIndex + 1));

  if (jumpSelect) {
    jumpSelect.addEventListener('change', async (e) => {
      const idx = parseInt(e.target.value, 10);
      if (!Number.isNaN(idx)) await loadQuestion(idx);
    });
  }

  async function initialize() {
    try {
      await loadSurveyData();
      await loadImagesJson();
      populateJumpDropdown();
      if (surveyQuestions.length && allCasesData?.cases?.length) {
        await loadQuestion(0);
      } else {
        questionTitleEl.textContent = 'Error: Failed to load survey or image data.';
      }
    } catch (err) {
      console.error('Initialization failed:', err);
      questionTitleEl.textContent = 'Error: Application failed to initialize.';
    }
  }

  initialize();
});

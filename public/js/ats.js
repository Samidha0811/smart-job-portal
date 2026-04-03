document.addEventListener('DOMContentLoaded', function() {
    const typeUpload = document.getElementById('typeUpload');
    const typePaste = document.getElementById('typePaste');
    const uploadContainer = document.getElementById('uploadContainer');
    const pasteContainer = document.getElementById('pasteContainer');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('resumeFile');
    const fileNameDisplay = document.getElementById('fileName');
    const checkScoreBtn = document.getElementById('checkScoreBtn');
    const resultsSection = document.getElementById('resultsSection');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const jobDescription = document.getElementById('jobDescription');
    const charCount = document.getElementById('charCount');

    // 1. Toggle Input Method
    typeUpload.addEventListener('change', () => {
        uploadContainer.classList.remove('d-none');
        pasteContainer.classList.add('d-none');
    });

    typePaste.addEventListener('change', () => {
        uploadContainer.classList.add('d-none');
        pasteContainer.classList.remove('d-none');
    });

    // 2. Drag and Drop Handling
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileSelect(e.target.files[0]);
        }
    });

    function handleFileSelect(file) {
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file.');
            return;
        }
        fileNameDisplay.textContent = `Selected: ${file.name}`;
        fileNameDisplay.classList.remove('d-none');
        dropZone.querySelector('p:not(.small)').textContent = 'File ready!';
    }

    // 3. Character Count for JD
    jobDescription.addEventListener('input', () => {
        charCount.textContent = `${jobDescription.value.length} characters`;
    });

    // 4. Submit and Analyze
    checkScoreBtn.addEventListener('click', async () => {
        const jd = jobDescription.value.trim();
        const resumeType = document.querySelector('input[name="resumeType"]:checked').value;
        
        if (!jd) {
            alert('Please enter a job description.');
            return;
        }

        const formData = new FormData();
        formData.append('jobDescription', jd);

        if (resumeType === 'upload') {
            const file = fileInput.files[0];
            if (!file) {
                alert('Please upload a resume file.');
                return;
            }
            formData.append('resumeFile', file);
        } else {
            const text = document.getElementById('resumeText').value.trim();
            if (!text) {
                alert('Please paste your resume text.');
                return;
            }
            formData.append('resumeText', text);
        }

        // Show loading
        loadingOverlay.classList.remove('d-none');
        resultsSection.classList.add('d-none');

        try {
            const response = await fetch('/check-ats', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                displayResults(result);
            } else {
                alert(result.error || 'Something went wrong.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while connecting to the server.');
        } finally {
            loadingOverlay.classList.add('d-none');
        }
    });

    function displayResults(data) {
        // Animation for Score Circle
        const circle = document.getElementById('scoreCircle');
        const scoreVal = document.getElementById('finalScoreVal');
        const scoreLabel = document.getElementById('scoreLabel');
        
        const score = data.score;
        const radius = 45;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (score / 100) * circumference;

        // Reset and animate
        circle.style.strokeDasharray = `${circumference}`;
        circle.style.strokeDashoffset = `${circumference}`;
        
        // Color coding
        circle.classList.remove('score-red', 'score-yellow', 'score-green');
        scoreLabel.classList.remove('bg-red', 'bg-yellow', 'bg-green');

        if (score <= 50) {
            circle.classList.add('score-red');
            scoreLabel.classList.add('bg-red');
            scoreLabel.textContent = 'Low Match';
        } else if (score <= 75) {
            circle.classList.add('score-yellow');
            scoreLabel.classList.add('bg-yellow');
            scoreLabel.textContent = 'Good Match';
        } else {
            circle.classList.add('score-green');
            scoreLabel.classList.add('bg-green');
            scoreLabel.textContent = 'High Match';
        }

        setTimeout(() => {
            circle.style.strokeDashoffset = offset;
            animateValue(scoreVal, 0, score, 2000);
        }, 100);

        // Stats Update
        document.getElementById('keywordStat').textContent = `${data.stats.keywords}%`;
        document.getElementById('sectionStat').textContent = `${data.stats.sections}%`;
        document.getElementById('lengthStat').textContent = `${data.stats.length}%`;

        // Suggestions
        const list = document.getElementById('suggestionsList');
        list.innerHTML = '';
        data.suggestions.forEach(s => {
            const li = document.createElement('li');
            li.textContent = s;
            list.appendChild(li);
        });

        // Missing Keywords
        const chipsContainer = document.getElementById('missingKeywords');
        chipsContainer.innerHTML = '';
        if (data.missingKeywords.length > 0) {
            data.missingKeywords.forEach(kw => {
                const span = document.createElement('span');
                span.className = 'keyword-chip';
                span.textContent = kw;
                chipsContainer.appendChild(span);
            });
        } else {
            chipsContainer.innerHTML = '<span class="text-success small"><i class="fas fa-check-circle me-1"></i> All key industry terms found!</span>';
        }

        // Show Results
        resultsSection.classList.remove('d-none');
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
});

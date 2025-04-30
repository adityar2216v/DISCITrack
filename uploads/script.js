let uploadedImages = [];

document.getElementById('imageInput').addEventListener('change', function(e) {
    const files = e.target.files;
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    uploadedImages = [];

    for (let file of files) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                preview.appendChild(img);
                uploadedImages.push(e.target.result);
            }
            reader.readAsDataURL(file);
        }
    }
});

function convertToPDF() {
    if (uploadedImages.length === 0) {
        alert('Please upload at least one image first!');
        return;
    }

    const pdfContent = document.createElement('div');
    uploadedImages.forEach(imgSrc => {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.style.maxWidth = '100%';
        img.style.pageBreakAfter = 'always';
        pdfContent.appendChild(img);
    });

    const opt = {
        margin: 1,
        filename: 'student_submission.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(pdfContent).save().then(() => {
        const pdfPreview = document.getElementById('pdfPreview');
        pdfPreview.style.display = 'block';
        pdfPreview.innerHTML = `<embed src="${URL.createObjectURL(new Blob([pdfContent.innerHTML], {type: 'application/pdf'}))}" width="100%" height="100%">`;
    });
}

document.getElementById('evaluationForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        rollNo: document.getElementById('rollNo').value,
        erp: document.getElementById('erp').value,
        subject: document.getElementById('subject').value,
        q1: document.getElementById('q1').value,
        q2: document.getElementById('q2').value,
        q3: document.getElementById('q3').value,
        q4: document.getElementById('q4').value,
        q5: document.getElementById('q5').value
    };

    try {
        const response = await fetch('save_evaluation.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        if (result.success) {
            alert('Evaluation saved successfully!');
            this.reset();
        } else {
            alert('Error saving evaluation: ' + result.message);
        }
    } catch (error) {
        alert('Error saving evaluation: ' + error.message);
    }
});
// ... existing code ...

let pdfDoc = null;
let pageNum = 1;
let canvas = null;
let fabricCanvas = null;
let currentColor = '#ff0000';
let isDrawing = false;

// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

function initPDFViewer() {
    const pdfViewer = document.getElementById('pdfViewer');
    canvas = document.getElementById('pdfCanvas');
    const drawingCanvas = document.getElementById('drawingCanvas');
    
    
    // Initialize Fabric.js canvas
    fabricCanvas = new fabric.Canvas('drawingCanvas', {
        isDrawingMode: true
    });
    
    // Set up drawing brush
    fabricCanvas.freeDrawingBrush.width = 2;
    fabricCanvas.freeDrawingBrush.color = currentColor;
    
    // Setup event listeners
    document.getElementById('prevPage').addEventListener('click', showPrevPage);
    document.getElementById('nextPage').addEventListener('click', showNextPage);
    document.getElementById('pageSlider').addEventListener('input', function() {
        pageNum = parseInt(this.value);
        renderPage(pageNum);
    });
    
    document.getElementById('redMarker').addEventListener('click', () => {
        currentColor = '#ff0000';
        fabricCanvas.freeDrawingBrush.color = currentColor;
    });
    
    document.getElementById('blackMarker').addEventListener('click', () => {
        currentColor = '#000000';
        fabricCanvas.freeDrawingBrush.color = currentColor;
    });
    
    document.getElementById('eraser').addEventListener('click', () => {
        fabricCanvas.isDrawingMode = false;
        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject) {
            fabricCanvas.remove(activeObject);
        }
    });
    document.getElementById('submitBtn').addEventListener('click', handleSubmit);
    document.getElementById('doneBtn').addEventListener('click', handleDone);
}

function showPrevPage() {
    if (pageNum <= 1) return;
    pageNum--;
    renderPage(pageNum);
}

function showNextPage() {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    renderPage(pageNum);
}

async function renderPage(num) {
    const page = await pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale: 1.5 });
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    fabricCanvas.setDimensions({
        width: viewport.width,
        height: viewport.height
    });
    
    const renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: viewport
    };
    
    await page.render(renderContext).promise;
    
    document.getElementById('pageNum').textContent = num;
    document.getElementById('pageSlider').value = num;
}

// Modify the convertToPDF function
async function convertToPDF() {
    if (uploadedImages.length === 0) {
        alert('Please upload at least one image first!');
        return;
    }

    const pdfContent = document.createElement('div');
    uploadedImages.forEach(imgSrc => {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.style.maxWidth = '100%';
        img.style.pageBreakAfter = 'always';
        pdfContent.appendChild(img);
    });

    const opt = {
        margin: 1,
        filename: 'student_submission.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    try {
        const pdf = await html2pdf().set(opt).from(pdfContent).output('blob');
        const url = URL.createObjectURL(pdf);
        
        // Load the PDF into the viewer
        loadPDF(url);
        
        // Show the PDF viewer
        document.getElementById('pdfViewer').classList.add('active');
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    }
}

async function loadPDF(url) {
    try {
        pdfDoc = await pdfjsLib.getDocument(url).promise;
        document.getElementById('pageCount').textContent = pdfDoc.numPages;
        document.getElementById('pageSlider').max = pdfDoc.numPages;
        
        // Render the first page
        renderPage(1);
    } catch (error) {
        console.error('Error loading PDF:', error);
        alert('Error loading PDF. Please try again.');
    }
}

// Initialize PDF viewer when the page loads
document.addEventListener('DOMContentLoaded', initPDFViewer);
// ... existing code ...

function initPDFViewer() {
    // ... existing code ...
    
    // Add event listeners for submit and done buttons
    document.getElementById('submitBtn').addEventListener('click', handleSubmit);
    document.getElementById('doneBtn').addEventListener('click', handleDone);
}

function handleSubmit() {
    // Save the annotations and form data
    const annotations = fabricCanvas.toJSON();
    const formData = {
        studentName: document.getElementById('name').value,
        rollNo: document.getElementById('rollNo').value,
        erp: document.getElementById('erp').value,
        subject: document.getElementById('subject').value,
        marks: {
            q1: document.getElementById('q1').value,
            q2: document.getElementById('q2').value,
            q3: document.getElementById('q3').value,
            q4: document.getElementById('q4').value,
            q5: document.getElementById('q5').value
        },
        annotations: annotations
    };

    // You can send this data to your server
    try {
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Evaluation submitted successfully!';
        document.querySelector('.pdf-toolbar').appendChild(successMessage);

        // Remove message after 3 seconds
        setTimeout(() => {
            successMessage.remove();
        }, 3000);
    } catch (error) {
        console.error('Error submitting evaluation:', error);
        alert('Error submitting evaluation. Please try again.');
    }
}

function handleDone() {
    // Close the PDF viewer
    const pdfViewer = document.getElementById('pdfViewer');
    pdfViewer.classList.remove('active');
    
    // Clear the form
    document.getElementById('evaluationForm').reset();
    
    // Clear the PDF viewer
    fabricCanvas.clear();
    pageNum = 1;
}

// Add styles for success message
const style = document.createElement('style');
style.textContent = `
    .success-message {
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #4CAF50;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        animation: fadeInOut 3s ease-in-out;
    }

    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -20px); }
        10% { opacity: 1; transform: translate(-50%, 0); }
        90% { opacity: 1; transform: translate(-50%, 0); }
        100% { opacity: 0; transform: translate(-50%, -20px); }
    }
`;
document.head.appendChild(style);
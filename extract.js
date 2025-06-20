import * as pdfjsLib from "./lib/pdfjs/pdf.min.js";
import JSZip from './lib/jszip/jszip.min.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = './lib/pdfjs/pdf.worker.min.js';

const upload = document.getElementById('pdf-upload');
const container = document.getElementById('image-container');
const selectAll = document.getElementById('select-all');
const downloadBtn = document.getElementById('download-btn');
const controls = document.getElementById('controls');

let images = [];

upload.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  images = [];
  container.innerHTML = '';
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport }).promise;
    const url = canvas.toDataURL('image/png');
    images.push({ url, pageNum });
    const div = document.createElement('div');
    div.className = 'item';
    const img = document.createElement('img');
    img.src = url;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    div.appendChild(img);
    div.appendChild(checkbox);
    container.appendChild(div);
  }
  controls.style.display = 'block';
});

selectAll.addEventListener('change', () => {
  const checkboxes = container.querySelectorAll('input[type=checkbox]');
  checkboxes.forEach(cb => cb.checked = selectAll.checked);
});

downloadBtn.addEventListener('click', async () => {
  const zip = new JSZip();
  let count = 1;
  const checkboxes = container.querySelectorAll('.item input[type=checkbox]');
  checkboxes.forEach((cb, index) => {
    if (cb.checked) {
      const imgData = images[index].url.split(',')[1];
      zip.file(`Foto ${count}.png`, imgData, { base64: true });
      count++;
    }
  });
  if (count === 1) {
    alert('Geen foto geselecteerd');
    return;
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'fotos.zip';
  a.click();
});

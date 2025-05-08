document.addEventListener('DOMContentLoaded', () => {
    const algorithmSelect = document.getElementById('algorithm');
    const dataTypeSelect = document.getElementById('data-type');
    const sizeInput = document.getElementById('size');
    const generateDataButton = document.getElementById('generate-data');
    const startSortButton = document.getElementById('start-sort');
    const saveResultsButton = document.getElementById('save-results');
    const sortingCanvas = document.getElementById('sorting-canvas').getContext('2d');
    const timeChartCanvas = document.getElementById('time-chart').getContext('2d');

    if (!algorithmSelect || !dataTypeSelect || !sizeInput || !generateDataButton || !startSortButton || !saveResultsButton || !sortingCanvas || !timeChartCanvas) {
        console.error('One or more elements are missing in the DOM.');
        return;
    }

    let data = [];
    let animationFrameId = null;
    let results = [];

    let timeChart = new Chart(timeChartCanvas, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'QuickSort',
                    data: [],
                    borderColor: '#e74c3c',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: '#e74c3c',
                    borderWidth: 1.5,
                },
                {
                    label: 'MergeSort',
                    data: [],
                    borderColor: '#3498db',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: '#3498db',
                    borderWidth: 1.5,
                },
                {
                    label: 'HeapSort',
                    data: [],
                    borderColor: '#2ecc71',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: '#2ecc71',
                    borderWidth: 1.5,
                },
                {
                    label: 'SelectionSort',
                    data: [],
                    borderColor: '#f1c40f',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: '#f1c40f',
                    borderWidth: 1.5,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Time (seconds)',
                        font: {
                            size: 14,
                            weight: 'bold',
                        },
                        color: '#555',
                    },
                    grid: {
                        color: '#eee',
                    },
                    ticks: {
                        color: '#777',
                    },
                },
                x: {
                    title: {
                        display: true,
                        text: 'Array Size',
                        font: {
                            size: 14,
                            weight: 'bold',
                        },
                        color: '#555',
                    },
                    grid: {
                        color: '#eee',
                    },
                    ticks: {
                        color: '#777',
                    },
                },
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Sorting Algorithm Performance',
                    font: {
                        size: 18,
                        weight: 'bold',
                    },
                    color: '#2c3e50',
                    padding: {
                        top: 10,
                        bottom: 20,
                    },
                },
                legend: {
                    labels: {
                        font: {
                            size: 14,
                        },
                        color: '#555',
                    },
                },
            },
        },
    });

    function generateRandomData(size, type) {
        const array = [];
        for (let i = 0; i < size; i++) {
            if (type === 'int') {
                array.push(Math.floor(Math.random() * 1000));
            } else if (type === 'float') {
                array.push(parseFloat((Math.random() * 1000).toFixed(2)));
            } else if (type === 'negative') {
                array.push(Math.floor(Math.random() * 2000) - 1000);
            }
        }
        return array;
    }

    function drawData(array, highlights = {}) {
        sortingCanvas.clearRect(0, 0, sortingCanvas.canvas.width, sortingCanvas.canvas.height);
        const barWidth = sortingCanvas.canvas.width / array.length;
        const maxValue = Math.max(...array);

        array.forEach((value, index) => {
            const barHeight = (value / maxValue) * sortingCanvas.canvas.height;

            const gradient = sortingCanvas.createLinearGradient(
                index * barWidth, sortingCanvas.canvas.height - barHeight,
                index * barWidth, sortingCanvas.canvas.height
            );
            gradient.addColorStop(0, '#3498db');
            gradient.addColorStop(1, '#2980b9');

            sortingCanvas.fillStyle = highlights[index] || gradient;
            sortingCanvas.fillRect(index * barWidth, sortingCanvas.canvas.height - barHeight, barWidth, barHeight);

            sortingCanvas.shadowColor = 'rgba(0, 0, 0, 0.2)';
            sortingCanvas.shadowBlur = 5;
            sortingCanvas.shadowOffsetX = 2;
            sortingCanvas.shadowOffsetY = 2;
        });

        sortingCanvas.shadowColor = 'transparent';
        sortingCanvas.shadowBlur = 0;
        sortingCanvas.shadowOffsetX = 0;
        sortingCanvas.shadowOffsetY = 0;

        const numbersContainer = document.getElementById('numbers-container');
        numbersContainer.innerHTML = '';

        array.forEach((value, index) => {
            const numberElement = document.createElement('span');
            numberElement.textContent = value;
            numbersContainer.appendChild(numberElement);
        });
    }

    async function visualizeSorting(algorithm, array) {
        const startTime = performance.now();

        const sortedArray = [...array];

        const algorithms = {
            async quicksort(arr) {
                await quickSort(arr, 0, arr.length - 1);
            },
            async mergesort(arr) {
                await mergeSort(arr, 0, arr.length - 1);
            },
            async heapsort(arr) {
                await heapSort(arr);
            },
            async selectionsort(arr) {
                await selectionSort(arr);
            },
        };

        if (algorithms[algorithm]) {
            await algorithms[algorithm](sortedArray);
        }

        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1000;

        const size = array.length;
        if (!timeChart.data.labels.includes(size.toString())) {
            timeChart.data.labels.push(size.toString());
        }

        const datasetIndex = timeChart.data.datasets.findIndex(dataset => dataset.label.toLowerCase() === algorithm.toLowerCase());
        if (datasetIndex !== -1) {
            timeChart.data.datasets[datasetIndex].data.push(elapsedTime);
            timeChart.update();
        } else {
            console.error('Dataset not found for algorithm:', algorithm);
        }

        console.log('TimeChart datasets after sorting:', timeChart.data.datasets);
    }

    async function quickSort(arr, low, high) {
        if (low < high) {
            const pi = await partition(arr, low, high);
            await quickSort(arr, low, pi - 1);
            await quickSort(arr, pi + 1, high);
        }
    }

    async function partition(arr, low, high) {
        const pivot = arr[high];
        let i = low - 1;
        for (let j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
                await drawWithHighlights(arr, { [i]: 'red', [j]: 'blue' });
            }
        }
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        await drawWithHighlights(arr, { [i + 1]: 'red', [high]: 'blue' });
        return i + 1;
    }

    async function mergeSort(arr, l, r) {
    if (l < r) {
        const m = Math.floor((l + r) / 2);
        await mergeSort(arr, l, m);
        await mergeSort(arr, m + 1, r);
        await merge(arr, l, m, r);
    }
}

async function merge(arr, l, m, r) {
    const n1 = m - l + 1;
    const n2 = r - m;
    const L = new Array(n1);
    const R = new Array(n2);

    for (let i = 0; i < n1; i++) L[i] = arr[l + i];
    for (let j = 0; j < n2; j++) R[j] = arr[m + 1 + j];

    let i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) {
            arr[k] = L[i];
            i++;
        } else {
            arr[k] = R[j];
            j++;
        }
        await drawWithHighlights(arr, { [k]: 'red' }); // Vizualizare
        k++;
    }

    while (i < n1) {
        arr[k] = L[i];
        await drawWithHighlights(arr, { [k]: 'red' }); // Vizualizare
        i++;
        k++;
    }

    while (j < n2) {
        arr[k] = R[j];
        await drawWithHighlights(arr, { [k]: 'red' }); // Vizualizare
        j++;
        k++;
    }
}

    async function heapSort(arr) {
        const n = arr.length;
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            await heapify(arr, n, i);
        }
        for (let i = n - 1; i > 0; i--) {
            [arr[0], arr[i]] = [arr[i], arr[0]];
            await drawWithHighlights(arr, { [0]: 'red', [i]: 'blue' });
            await heapify(arr, i, 0);
        }
    }

    async function heapify(arr, n, i) {
        let largest = i;
        const l = 2 * i + 1;
        const r = 2 * i + 2;

        if (l < n && arr[l] > arr[largest]) largest = l;
        if (r < n && arr[r] > arr[largest]) largest = r;

        if (largest !== i) {
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            await drawWithHighlights(arr, { [i]: 'red', [largest]: 'blue' });
            await heapify(arr, n, largest);
        }
    }

    async function selectionSort(arr) {
        const n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            for (let j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIdx]) minIdx = j;
                await drawWithHighlights(arr, { [i]: 'red', [j]: 'blue', [minIdx]: 'orange' });
            }
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
            await drawWithHighlights(arr, { [i]: 'red', [minIdx]: 'blue' });
        }
    }

    function drawWithHighlights(array, highlights) {
        return new Promise((resolve) => {
            animationFrameId = requestAnimationFrame(() => {
                drawData(array, highlights);
                resolve();
            });
        });
    }

    generateDataButton.addEventListener('click', () => {
        const size = parseInt(sizeInput.value);
        const dataType = dataTypeSelect.value;
        data = generateRandomData(size, dataType);
        drawData(data);
    });

    startSortButton.addEventListener('click', async () => {
        const algorithm = algorithmSelect.value;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        await visualizeSorting(algorithm, data);
    });

    saveResultsButton.addEventListener('click', () => {
        const algorithm = algorithmSelect.value;
        const size = parseInt(sizeInput.value);
        const dataset = timeChart.data.datasets.find(d => d.label.toLowerCase() === algorithm.toLowerCase());

        if (dataset && dataset.data.length > 0) {
            const elapsedTime = dataset.data.slice(-1)[0];
            results.push({ algorithm, size, elapsedTime });
            console.log('Results saved:', results);
        } else {
            console.error('Dataset not found or no data available.');
        }
    });
});
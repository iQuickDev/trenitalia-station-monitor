window.onload = async () => {
    let currentDirection = localStorage.getItem('direction') || 'departures';
    const stations = await fetch('./stations.json').then(res => res.json());
    const selector = document.querySelector('#stationSelector');
    const header = document.querySelector('h1');

    stations.forEach(station => {
        const option = document.createElement('option');
        option.value = station.code;
        option.textContent = station.name;
        selector.appendChild(option);
    });

    selector.value = localStorage.getItem('stationCode') || '2000';
    header.textContent = currentDirection === 'departures' ? 'PARTENZE' : 'ARRIVI';

    document.addEventListener('keydown', (e) => {
        if (e.shiftKey && e.key === 'S') {
            selector.classList.toggle('hidden');
            document.body.classList.toggle('dim');
        }
        if (e.shiftKey && e.key === 'D') {
            currentDirection = currentDirection === 'departures' ? 'arrivals' : 'departures';
            localStorage.setItem('direction', currentDirection);
            header.textContent = currentDirection === 'departures' ? 'PARTENZE' : 'ARRIVI';
            loadStationData(selector.value, currentDirection);
        }
    });

    selector.addEventListener('change', async (e) => {
        const stationCode = e.target.value;
        localStorage.setItem('stationCode', stationCode);
        const tableBody = document.querySelector('#trains tbody');
        tableBody.innerHTML = '';
        await loadStationData(stationCode, currentDirection);
    });

    await loadStationData(selector.value, currentDirection);

    setInterval(() => {
        loadStationData(selector.value, currentDirection);
    }, 120000);
}

async function loadStationData(stationCode, direction = 'departures') {
    const isArrivals = direction === 'arrivals';
    const url = `https://iechub.rfi.it/ArriviPartenze/ArrivalsDepartures/Monitor?Arrivals=${isArrivals}&PlaceId=${stationCode}`;
    const htmlContent = await fetch("https://corsproxy.io/?url=" + url).then(res => res.text())
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')
    const scrapedTableRows = doc.querySelectorAll('#monitor tbody tr')
    const table = document.querySelector('#trains')
    const tableBody = table.querySelector('tbody')

    tableBody.innerHTML = '';

    scrapedTableRows.forEach(tr => {
        const row = document.createElement('tr')
        const cells = tr.querySelectorAll('td')
        for (let i = 2; i < cells.length - 1; i++) {
            const tdElement = document.createElement('td')
            if (i === 2) {
                tdElement.textContent = categoryToShortName(cells[i - 1].querySelector('img').alt.trim())
            }
            tdElement.textContent += " " + cells[i].innerText.trim()

            if (i === 5) {
                if (tdElement.textContent.trim()) {
                    tdElement.textContent += '\''
                }
            }
            row.appendChild(tdElement)
        }
        tableBody.appendChild(row)
    })
}

function categoryToShortName(category) {
    const mapping = {
        'Categoria INTERCITY': 'IC',
        'Categoria ALTA VELOCITA\'': 'AV',
        'Categoria MXP': 'MXP',
        'Categoria RE': 'RE',
        'Categoria REG': 'REG',
        'Categoria EC': 'EC',
        'Categoria RV': 'RV',
        'Categoria BUS': 'BUS',
        'Categoria RJ': 'RJ',
        'Categoria REGIONALE VELOCE': 'RV',
        'Categoria ARL': 'ARL',
    }

    return mapping[category] || category;
}

function createMatrixCanvas() {
    const orangeCanvas = document.createElement('canvas');
    const orangeCtx = orangeCanvas.getContext('2d');
    orangeCanvas.width = window.innerWidth;
    orangeCanvas.height = window.innerHeight / 5.5;
    orangeCanvas.className = 'orange-canvas';

    const blackCanvas = document.createElement('canvas');
    const blackCtx = blackCanvas.getContext('2d');
    blackCanvas.width = window.innerWidth;
    blackCanvas.height = window.innerHeight * 3.1;
    blackCanvas.className = 'black-canvas';
    blackCanvas.style.top = window.innerHeight / 5.5 + 'px';

    const cellSize = 6;
    const cols = Math.floor(window.innerWidth / cellSize);
    const blackRows = Math.floor(blackCanvas.height / cellSize);

    orangeCtx.fillStyle = '#ff8800';
    for (let i = 0; i < Math.floor(orangeCanvas.height / cellSize); i++) {
        for (let j = 0; j < cols; j++) {
            orangeCtx.fillRect(j * cellSize, i * cellSize, cellSize - 1, cellSize - 1);
        }
    }

    blackCtx.fillStyle = '#0a0a0a';
    for (let i = 0; i < blackRows; i++) {
        for (let j = 0; j < cols; j++) {
            blackCtx.fillRect(j * cellSize, i * cellSize, cellSize - 1, cellSize - 1);
        }
    }

    document.body.appendChild(blackCanvas);
    document.body.appendChild(orangeCanvas);
}

createMatrixCanvas();
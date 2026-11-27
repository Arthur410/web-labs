const pieces = [
  // палка
  [
    [1, 1, 1, 1]
  ],
  // кубик
  [
    [1, 1],
    [1, 1]
  ],
  // буква Г
  [
    [0, 0, 1],
    [1, 1, 1]
  ],
  [
    [1, 0, 0],
    [1, 1, 1]
  ],
  // зигзаг
  [
    [0, 1, 1],
    [1, 1, 0]
  ],
  [
    [1, 1, 0],
    [0, 1, 1]
  ],
  // джостик
  [
    [0, 1, 0],
    [1, 1, 1]
  ],
];

const availableColors = [
  '#530FAD',
  '#A600A6',
  '#CCF600',
  '#FFE800',
  '#FF0000',
  '#00CC00',
  '#FF7400'
];



type Piece = { matrix: number[][]; x: number; y: number; colorIndex: number };
type Score = { playerName: string; score: number };

function element<T extends HTMLElement>(id: string, type: { new(): T }): T {
  const node = document.getElementById(id);
  if (!(node instanceof type)) throw new Error(`Элемент ${id} не найден или имеет неверный тип`);
  return node;
}

document.addEventListener('DOMContentLoaded', () => {
  const firstLevelTickRate = 1000;
  const secondLevelTickRate = 500;
  const thirdLevelTickRate = 250;

  const canvas = element('canvas', HTMLCanvasElement);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D недоступен');
  const canvasContext: CanvasRenderingContext2D = context;
  const field = createField(10, 20);

  let piece: Piece;
  let currentScore = 0;
  let gameLoop: ReturnType<typeof setInterval> | undefined;
  let isGameOver = false;

  let isAudioEnabled = true;

  const playerNameText = element('playerName', HTMLElement);
  const playerNameInput = element('playerNameInput', HTMLInputElement);
  const playerNameButton = element('playerNameButton', HTMLElement);

  const scoreContainer = element('currentScore', HTMLElement);
  const startButton = element('startButton', HTMLElement);
  const gameInfo = element('gameInfo', HTMLElement);

  const canvasContainer = element('canvasContainer', HTMLElement);
  const infoContainer = element('infoContainer', HTMLElement);
  const loginInfo = element('loginInfo', HTMLElement);

  const scoreTable = element('scoreTable', HTMLElement);
  const gameLogger = element('gameLogger', HTMLElement);
  let restartGame = element('restartGame', HTMLElement);

  const closeGuide = element('closeGuide', HTMLElement);
  const openGuide = element('openGuide', HTMLElement);
  const guideBlock = element('guideBlock', HTMLElement);
  const gameLogMessage = element('gameLogMessage', HTMLElement);

  const soundToggler = element('soundToggler', HTMLElement)
  const soundTogglerIcon = element('soundTogglerIcon', HTMLElement)

  toggleGameLoggerView(false);
  updateTableScores();
  gameInfo.style.display = "none";

  let storedName = getPlayerName();
  if (storedName) {
    playerNameText.textContent = storedName;
    hideLogin();
    infoContainer.classList.add('inactive');
    canvasContainer.classList.add('active');
  } else {
    infoContainer.classList.add('active');
    canvasContainer.classList.add('inactive');
  }

  function playAudio(name: 'death' | 'coin' | 'win') {
    if (!isAudioEnabled) return;

    const audio = new Audio();
    audio.src = new URL(`./assets/${name}.mp3`, import.meta.url).href;
    audio.autoplay = true;
  }

  function getPlayerName() {
    const storedPlayerName = localStorage.getItem('playerName');
    if (storedPlayerName) {
      return storedPlayerName;
    } else {
      return '';
    }
  }

  function setPlayerName() {
    const inputName = playerNameInput.value;

    if (inputName.trim() !== '') {
      localStorage.setItem('playerName', inputName);
      storedName = inputName;
      playerNameText.textContent = inputName
    }

    hideLogin();
  }

  function hideLogin() {
    gameInfo.style.display = "flex";
    gameInfo.style.flexDirection = "column";

    infoContainer.style.width = "auto";
    infoContainer.style.height = "auto";
    scoreContainer.textContent = "0";
    loginInfo.style.display = "none";
  }

  function toggleGameLoggerView(isShow: boolean) {
    if (isShow) {
      gameLogger.style.opacity = "1";
      gameLogger.style.zIndex = "1";
    } else {
      gameLogger.style.opacity = "0";
      gameLogger.style.zIndex = "-1";
    }
  }


  function drawField() {
    canvasContext.fillStyle = 'black';
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < field.length; row++) {
      for (let col = 0; col < field[row].length; col++) {
        const colorIndex = field[row][col];
        if (colorIndex !== 0) {
          drawSquare(col, row, colorIndex);
        }
      }
    }
  }

  function drawSquare(x: number, y: number, colorIndex: number) {
    const SQUARE_SIZE = 24;

    canvasContext.fillStyle = availableColors[colorIndex - 1];
    canvasContext.fillRect(x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
    canvasContext.strokeStyle = 'gray';
    canvasContext.strokeRect(x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
  }

  // Функция для создания поля
  function createField(cols: number, rows: number): number[][] {
    const matrix = [];

    for (let row = 0; row < rows; row++) {
      matrix.push(new Array(cols).fill(0));
    }

    return matrix;
  }

  // Функция для создания фигур
  function createPiece(): Piece {
    const randomInt = Math.random() * pieces.length;
    const getRandomPiece = Math.floor(randomInt);
    const getRandomColorIndex = Math.floor(randomInt) + 1;
    return {
      matrix: pieces[getRandomPiece],
      colorIndex: getRandomColorIndex,
      x: Math.floor((10 - pieces[getRandomPiece][0].length) / 2),
      y: 0
    };
  }

  // Функция для определения столконовений
  function hasCollision() {
    const matrix = piece.matrix;
    const offsetX = piece.x;
    const offsetY = piece.y;

    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] !== 0) {
          const fieldRow = field[row + offsetY];

          if (!fieldRow || fieldRow[col + offsetX] !== 0) {
            return true;
          }

          if (row + offsetY >= field.length) {
            return true;
          }
        }
      }
    }

    return false;
  }

  function merge() {
    const matrix = piece.matrix;
    const offsetX = piece.x;
    const offsetY = piece.y;

    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] !== 0) {
          field[row + offsetY][col + offsetX] = piece.colorIndex;
        }
      }
    }
  }

  function rotate() {
    const matrix = piece.matrix;
    const tempMatrix: number[][] = [];

    for (let row = 0; row < matrix[0].length; row++) {
      tempMatrix[row] = [];
      for (let col = 0; col < matrix.length; col++) {
        tempMatrix[row][col] = matrix[col][matrix[0].length - 1 - row];
      }
    }

    piece.matrix = tempMatrix;

    if (hasCollision()) {
      piece.matrix = matrix;
    }
  }

  function movePiece(dir: number) {
    piece.x += dir;

    if (hasCollision()) {
      piece.x -= dir;
    }
  }

  function dropPiece() {
    piece.y++;

    if (hasCollision()) {
      piece.y--;
      merge();
      clearLines();
      piece = createPiece();

      if (hasCollision()) {
        const newScore = {
          playerName: storedName,
          score: currentScore,
        };

        clearInterval(gameLoop);
        toggleGameLoggerView(true);
        gameLogMessage.textContent = `Вы проиграли! Ваш счет ${currentScore}`

        addBestScore(newScore);
        updateTableScores();
        playAudio('death');
        isGameOver = true;
      }
    }
  }

  function clearLines() {
    const remaining = field.filter(row => row.some(cell => cell === 0));
    const cleared = field.length - remaining.length;
    if (!cleared) return;

    const oldScore = currentScore;
    currentScore += cleared;
    const emptyRows = Array.from({ length: cleared }, () => new Array(field[0].length).fill(0));
    field.splice(0, field.length, ...emptyRows, ...remaining);

    const tickRate = (score: number) => score > 3 ? thirdLevelTickRate : score > 2 ? secondLevelTickRate : firstLevelTickRate;
    if (tickRate(currentScore) !== tickRate(oldScore)) {
      clearInterval(gameLoop);
      gameLoop = setInterval(update, tickRate(currentScore));
      playAudio('win');
    }
    playAudio('coin');
  }

  function update(isIntervalMode = true) {
    if (isIntervalMode) {
      dropPiece();
    }
    updateScore();
    drawField();
    if (!isGameOver) drawPiece();
  }

  function updateScore() {
    scoreContainer.textContent = String(currentScore);
  }

  function drawPiece() {
    const matrix = piece.matrix;
    const offsetX = piece.x;
    const offsetY = piece.y;

    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] !== 0) {
          drawSquare(col + offsetX, row + offsetY, piece.colorIndex);
        }
      }
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (isGameOver) return;

    switch (event.key) {
      case 'ArrowLeft':
        movePiece(-1);
        break;
      case 'ArrowRight':
        movePiece(1);
        break;
      case 'ArrowDown':
        dropPiece();
        break;
      case ' ':
        rotate();
        break;
    }

    update(false);
  }

  function startNewGame() {
    isGameOver = false;
    piece = createPiece();
    currentScore = 0;
    field.forEach(row => row.fill(0));
    scoreContainer.textContent = String(currentScore);
    gameLoop = setInterval(update, firstLevelTickRate);
    drawField();
  }

  function getBestScores(): Score[] {
    try {
      const scores = JSON.parse(localStorage.getItem('bestScores') || '[]');
      return Array.isArray(scores)
        ? scores.filter(item => item && typeof item.playerName === 'string' && Number.isFinite(item.score))
        : [];
    } catch {
      return [];
    }
  }

  function addBestScore(newScore: Score) {
    const bestScores = getBestScores();
    bestScores.push(newScore);

    // Сортируем результаты в убывающем порядке (от большего к меньшему)
    bestScores.sort((a, b) => b.score - a.score);

    // Ограничиваем массив только пятью лучшими результатами
    bestScores.splice(5);

    localStorage.setItem('bestScores', JSON.stringify(bestScores));
  }

  function updateTableScores() {
    const scores = getBestScores();

    scoreTable.replaceChildren(...scores.map(({ playerName, score }) => {
      const row = document.createElement('p');
      row.textContent = `${playerName}: ${score}`;
      return row;
    }));
  }

  restartGame.addEventListener('click', () => {
    if (!gameLoop && !isGameOver) {
      startNewGame()
      document.addEventListener('keydown', handleKeyPress);
    } else if (isGameOver) {
      startNewGame();
    }
    toggleGameLoggerView(false);
  });

  startButton.addEventListener('click', () => {
    if (!gameLoop && !isGameOver) {
      startNewGame()
      document.addEventListener('keydown', handleKeyPress);
    } else if (isGameOver) {
      startNewGame();
    }
    toggleGameLoggerView(false);
  });

  playerNameButton.addEventListener('click', () => {
    setPlayerName()
    // Проверяем текущий класс .main-page__info
    if (infoContainer.classList.contains('active')) {
      // Если .main-page__info имеет класс active, меняем классы местами
      infoContainer.classList.remove('active');
      canvasContainer.classList.remove('inactive');
      infoContainer.classList.add('inactive');
      canvasContainer.classList.add('active');
    } else {
      // Если .main-page__info имеет класс inactive, меняем классы местами обратно
      infoContainer.classList.remove('inactive');
      canvasContainer.classList.remove('active');
      infoContainer.classList.add('active');
      canvasContainer.classList.add('inactive');
    }
  });

  closeGuide.addEventListener('click', () => {
    guideBlock.style.display = "none";
  })

  openGuide.addEventListener('click', () => {
    guideBlock.style.display = "flex";
  })

  soundToggler?.addEventListener('click', () => {
    if (isAudioEnabled) {
      soundTogglerIcon.setAttribute('src', new URL('./assets/soundOff.svg', import.meta.url).href)
    } else {
      soundTogglerIcon.setAttribute('src', new URL('./assets/soundOn.svg', import.meta.url).href)
    }
    isAudioEnabled = !isAudioEnabled;
  })
});
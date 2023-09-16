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



document.addEventListener('DOMContentLoaded', () => {
  const firstLevelTickRate = 1000;
  const secondLevelTickRate = 500;
  const thirdLevelTickRate = 250;

  const canvas = document.getElementById('canvas');
  const canvasContext = canvas.getContext('2d');
  const field = createField(10, 20);

  let piece;
  let currentScore = 0;
  let gameLoop;
  let isGameOver = false;

  let isAudioEnabled = true;

  const playerNameText = document.getElementById('playerName');
  const playerNameInput = document.getElementById('playerNameInput');
  const playerNameButton = document.getElementById('playerNameButton');

  const scoreContainer = document.getElementById('currentScore');
  const startButton = document.getElementById('startButton');
  const gameInfo = document.getElementById('gameInfo');

  const canvasContainer = document.getElementById('canvasContainer');
  const infoContainer = document.getElementById('infoContainer');
  const loginInfo = document.getElementById('loginInfo');

  const scoreTable = document.getElementById('scoreTable');
  const gameLogger = document.getElementById('gameLogger');
  let restartGame = document.getElementById('restartGame');

  const closeGuide = document.getElementById('closeGuide');
  const openGuide = document.getElementById('openGuide');
  const guideBlock = document.getElementById('guideBlock');
  const gameLogMessage = document.getElementById('gameLogMessage');

  const soundToggler = document.getElementById('soundToggler')
  const soundTogglerIcon = document.getElementById('soundTogglerIcon')

  toggleGameLoggerView(false);
  updateTableScores();

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

  function playAudio(name) {
    if (!isAudioEnabled) return;

    const audio = new Audio();
    audio.src = `./src/assets/${name}.mp3`;
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

  function toggleGameLoggerView(isShow) {
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

  function drawSquare(x, y, colorIndex) {
    const SQUARE_SIZE = 24;

    canvasContext.fillStyle = availableColors[colorIndex - 1];
    canvasContext.fillRect(x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
    canvasContext.strokeStyle = 'gray';
    canvasContext.strokeRect(x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
  }

  // Функция для создания поля
  function createField(cols, rows) {
    const matrix = [];

    for (let row = 0; row < rows; row++) {
      matrix.push(new Array(cols).fill(0));
    }

    return matrix;
  }

  // Функция для создания фигур
  function createPiece() {
    const getRandomPiece = Math.floor(Math.random() * pieces.length);
    const getRandomColorIndex = Math.floor(Math.random() * availableColors.length) + 1;
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
    const tempMatrix = [];

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

  function movePiece(dir) {
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
    for (let row = field.length - 1; row >= 0; row--) {
      if (field[row].every(cell => cell !== 0)) {
        field.splice(row, 1);
        field.unshift(new Array(10).fill(0));
        currentScore++;

        if (currentScore > 2) {
          clearInterval(gameLoop);
          gameLoop = setInterval(update, secondLevelTickRate);
          playAudio('win');
        }

        if (currentScore > 3) {
          clearInterval(gameLoop);
          gameLoop = setInterval(update, thirdLevelTickRate);
          playAudio('win');
        }

        playAudio('coin');
      }
    }
  }

  function update(isIntervalMode = true) {
    if (isIntervalMode) {
      dropPiece();
      updateScore();
    }

    drawField();
    clearLines();
    drawPiece();
  }

  function updateScore() {
    scoreContainer.textContent = currentScore;
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

  function handleKeyPress(event) {
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
    scoreContainer.textContent = currentScore;
    gameLoop = setInterval(update, firstLevelTickRate);
    drawField();
  }

  function getBestScores() {
    const storedScores = localStorage.getItem('bestScores');
    if (storedScores) {
      return JSON.parse(storedScores);
    } else {
      return [];
    }
  }

  function addBestScore(newScore) {
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

    scoreTable.innerHTML = ''
    for (let i = 0; i < scores.length; i++) {
      scoreTable.innerHTML +=
        `<p>${scores[i].playerName}: ${scores[i].score}</p>`
    }
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
      soundTogglerIcon.setAttribute('src', './src/assets/soundOff.svg')
    } else {
      soundTogglerIcon.setAttribute('src', './src/assets/soundOn.svg')
    }
    isAudioEnabled = !isAudioEnabled;
  })
});
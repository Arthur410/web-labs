import {pieces} from "./pieces";
import {availableColors} from "./availableColors";

document.addEventListener('DOMContentLoaded', () => {
  const tickRate = 500;
  const canvas = document.getElementById('canvas');
  const canvasContext = canvas.getContext('2d');
  const field = createField(10, 20);

  let piece;
  let currentScore = 0;
  let gameLoop;
  let isGameOver = false;

  const playerNameText = document.getElementById('playerName');
  const scoreContainer = document.getElementById('currentScore');
  const playerNameInput = document.getElementById('playerNameInput');
  const playerNameButton = document.getElementById('playerNameButton');
  const startButton = document.getElementById('startButton');

  let storedName = getPlayerName();
  if (storedName) {
    playerNameText.textContent = storedName;
    disablePlayerForm();
  }

  function disablePlayerForm() {
    playerNameInput.style.display = "none";
    playerNameButton.style.display = "none";
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

      disablePlayerForm();
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
        clearInterval(gameLoop);
        alert(`Game Over! ${storedName} Your final Score: ${currentScore}`);
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

        if (currentScore > 5) {
          clearInterval(gameLoop);
          alert('Congratulations ' + storedName + '!');
          isGameOver = true;
        }
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
    gameLoop = setInterval(update, tickRate);
    drawField();
  }

  startButton.addEventListener('click', () => {
    if (!gameLoop && !isGameOver) {
      startNewGame()
      document.addEventListener('keydown', handleKeyPress);
    } else if (isGameOver) {
      startNewGame();
    }
  });


  playerNameButton.addEventListener('click', setPlayerName);
});
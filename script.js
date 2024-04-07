import { Chess } from './node_modules/chess.js/dist/esm/chess.js';

var game = new Chess();
var whiteSquareGrey = '#a9a9a9'
var blackSquareGrey = '#696969'

function removeGreySquares() {
  $('#board .square-55d63').css('background', '')
}

function greySquare(square) {
  var $square = $('#board .square-' + square)

  var background = whiteSquareGrey
  if ($square.hasClass('black-3c85d')) {
    background = blackSquareGrey
  }

  $square.css('background', background)
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd
}
var board = Chessboard('board', config)

function onDragStart(source, piece, position, orientation) {
  if(game.isGameOver()) return false;

  // or if it's not that side's turn
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
    (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
}

function minimaxMove(depth) { 
  var bestMove = null;
  var bestScore = -Infinity;
  
  var moves = game.moves({ verbose: true });

  for (var i = 0; i < moves.length; i++) {
    var move = moves[i];
    game.move(move);
    var score = minimax(depth - 1, -Infinity, Infinity, false);
    game.undo();
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  
  return bestMove;
}

function minimax(depth, alpha, beta, maximizingPlayer) {
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard();
  }

  var moves = game.moves();

  if (maximizingPlayer) {
    var maxEval = -Infinity;
    for (var i = 0; i < moves.length; i++) {
      game.move(moves[i]);
      maxEval = Math.max(maxEval, minimax(depth - 1, alpha, beta, false));
      alpha = Math.max(alpha, maxEval);
      game.undo();
      if (beta <= alpha) {
        break;
      }
    }
    return maxEval;
  } else {
    var minEval = Infinity;
    for (var i = 0; i < moves.length; i++) {
      game.move(moves[i]);
      minEval = Math.min(minEval, minimax(depth - 1, alpha, beta, true));
      beta = Math.min(beta, minEval);
      game.undo();
      if (beta <= alpha) {
        break;
      }
    }
    return minEval;
  }
}

function evaluateBoard() {
  // Simple evaluation function for demonstration purposes
  var pieceValues = {
    'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 100
  };

  var score = 0;
  var fen = game.fen();
  var pieces = fen.split(' ')[0];

  for (var i = 0; i < pieces.length; i++) {
    if (pieceValues.hasOwnProperty(pieces[i])) {
      score += pieceValues[pieces[i]];
    }
  }

  return score;
}

function onDrop(source, target) {
  removeGreySquares()

  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'

  window.setTimeout(function() {
    var bestMove = minimaxMove(10); // Adjust the depth of the minimax algorithm as needed
    game.move(bestMove);
    board.position(game.fen());
  }, 250);
}

function onMouseoverSquare(square, piece) {
  var moves = game.moves({
    square: square,
    verbose: true
  })

  if (moves.length === 0) return

  greySquare(square)

  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to)
  }
}

function onMouseoutSquare(square, piece) {
  removeGreySquares()
}

function onSnapEnd() {
  board.position(game.fen())
}

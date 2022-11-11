import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

function Square(props) {
  return (
    <h1 className="square" onClick={props.onClick}>
      {props.value}
    </h1>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <table>
        <tbody>
          <tr>
            <td>{this.renderSquare(0)}</td>
            <td>{this.renderSquare(1)}</td>
            <td>{this.renderSquare(2)}</td>
          </tr>
          <tr>
            <td>{this.renderSquare(3)}</td>
            <td>{this.renderSquare(4)}</td>
            <td>{this.renderSquare(5)}</td>
          </tr>
          <tr>
            <td>{this.renderSquare(6)}</td>
            <td>{this.renderSquare(7)}</td>
            <td>{this.renderSquare(8)}</td>
          </tr>
        </tbody>
      </table>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      isAI: false,
      buttonAI: false,
    };
    this.reset = this.reset.bind(this);
  }

  reset() {
    this.setState({
      isAI: false,
      buttonAI: false,
      stepNumber: 0,
      xIsNext: true,
      history: [
        {
          squares: Array(9).fill(null),
        },
      ],
    });
  }

  makeMove(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return Promise.resolve();
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    const nextState = {
      history: history.concat([
        {
          squares: squares,
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    };
    // Return a Promise that resolves when setState is done
    return new Promise((resolve, reject) => {
      this.setState(nextState, resolve);
    });
  }

  async handleClick(i) {
    await this.makeMove(i);

    const isBoardFilled = function (squares) {
      for (let i = 0; i < squares.length; i++) {
        if (squares[i] === null) {
          return false;
        }
      }
      return true;
    };

    function findBestSquare(squares, player) {
      const opponent = player === "X" ? "O" : "X";

      const minimax = (squares, isMax) => {
        const winner = calculateWinner(squares);

        if (winner === player) {
          return { square: -1, score: 1 };
        }

        if (winner === opponent) {
          return { square: -1, score: -1 };
        }
        // If Tie, score is 0
        if (isBoardFilled(squares)) {
          return { square: -1, score: 0 };
        }

        const best = { square: -1, score: isMax ? -1000 : 1000 };

        for (let i = 0; i < squares.length; i++) {
          // If square is already filled, skip to the next
          if (squares[i]) {
            continue;
          }
          // If square is unfilled, valid move
          squares[i] = isMax ? player : opponent;
          // Simulate the game until the end game and get the score by calling minimax
          const score = minimax(squares, !isMax).score;
          // Undo the move
          squares[i] = null;

          if (isMax) {
            // Maximizing player, find the largest score and move
            if (score > best.score) {
              best.score = score;
              best.square = i;
            }
          } else {
            // Minimizing opponent, find the smallest score and move
            if (score < best.score) {
              best.score = score;
              best.square = i;
            }
          }
        }
        // The move for the best score at the end of the game
        return best;
      };

      // The best move for the player
      return minimax(squares, true).square;
    }
    // AI move if one player mode
    const squares = this.state.history[this.state.stepNumber].squares.slice();
    const bestSquare = findBestSquare(squares, this.state.xIsNext ? "X" : "O");
    if (bestSquare !== -1 && this.state.isAI) {
      function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
      await sleep(500);
      await this.makeMove(bestSquare);
    }
  }

  jumpTo(step) {
    this.setState({ stepNumber: step, xIsNext: step % 2 === 0 });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ? "Go to move #" + move : "Go to game start";
      return (
        <li
          style={{ background: "rgba(183, 178, 178, 0.7)" }}
          className="list-group-item text-center"
          key={move}
        >
          <button
            style={{ fontSize: "1.1em", color: "black" }}
            className="btn btn-outline-secondary"
            onClick={() => this.jumpTo(move)}
          >
            {desc}
          </button>
        </li>
      );
    });

    // Uncomment if you want the game to automatically restart after the end of a session
    // You will not be able to enjoy replay functionnality

    //this.componentDidUpdate = () => {
    //  if (winner || this.state.stepNumber === 9) {
    //    setTimeout(() => this.reset(), 2000);
    //  }
    //};

    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else if (!winner && this.state.stepNumber !== 9) {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    } else if (!winner && this.state.stepNumber === 9) {
      status = "Draw !";
    }

    return (
      <div className="container">
        <h1 className="text-center tic-tac-toe">Tic-Tac-Toe Game</h1>

        <div className="row" style={{ marginTop: "20px" }}>
          <div className="col-sm-12 col-md-6">
            <div style={{ alignItems: "center", display: "flex" }}>
              <h3
                className="m-3"
                style={{
                  fontSize: "1.2em",
                  minWidth: "180px",
                  background: "orangered",
                  borderRadius: "10px",
                  padding: "10px",
                  boxShadow: "0 0 10px 0 rgba(0,0,0,0.5)",
                }}
              >
                <span className="fs-5">Mode: </span>
                {!this.state.isAI ? "Two Players" : "One Player"}
              </h3>
              <button
                className="btn btn-warning"
                style={{ fontSize: "1em" }}
                disabled={this.state.stepNumber !== 0 ? "disabled" : ""}
                onClick={() => this.setState({ isAI: !this.state.isAI })}
              >
                Change
              </button>
            </div>{" "}
            <select
              disabled={this.state.stepNumber !== 0 ? "disabled" : ""}
              className="form-select"
              style={{
                marginBottom: "20px",
                maxWidth: "200px",
                background: "rgba(183, 178, 178, 0.5)",
                textAlign: "center",
                fontSize: "1.1em",
              }}
              onChange={(e) =>
                e.target.value === "X"
                  ? this.setState({ xIsNext: true })
                  : this.setState({ xIsNext: false })
              }
            >
              <option value="X">Choose first player X</option>
              <option value="O">Choose first player O</option>
            </select>
            <Board
              squares={current.squares}
              onClick={(i) => this.handleClick(i)}
            />
            <button
              disabled={this.state.stepNumber === 0 ? "disabled" : ""}
              className="btn btn-primary"
              style={{
                fontSize: "0.9em",
                marginTop: "2em",
                marginLeft: "95px",
              }}
              onClick={this.reset}
            >
              New Game
            </button>
          </div>
          <div
            className="col-sm-12 col-md-6"
            style={{
              marginTop: "20px",
              maxWidth: "300px",
            }}
          >
            <hr />
            <div>
              <h4
                style={{
                  fontSize: "1.2em",
                  background: "orange",
                  textAlign: "center",
                  borderRadius: "10px",
                  padding: "5px",
                  maxWidth: "150px",
                  boxShadow: "0 0 10px 0 rgba(0,0,0,0.5)",
                }}
              >
                {status}
              </h4>
            </div>
            <ol className="list-group list-group-numbered">{moves}</ol>
          </div>
        </div>
        <div className="footer">
          &copy; Copyright by Crypt0zauruS
          <h1>
            Follow me on{" "}
            <a
              className="twitter"
              target="_blank"
              rel="noopener noreferrer"
              href="https://twitter.com/CryptosaurusRe4"
            >
              <i className="fab fa-twitter"></i>
            </a>{" "}
            and{" "}
            <a
              className="github"
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/Crypt0zauruS"
            >
              <i className="fab fa-github"></i>
            </a>
          </h1>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { MsgType } from "../enums/globals";
export class Game {
  public player1: WebSocket;
  public player2: WebSocket;
  private board: Chess;
  private startTime: Date;
  private moveCount: number;
  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.startTime = new Date();
    this.moveCount = 0;
    this.player1.send(
      JSON.stringify({
        type: MsgType.INIT_GAME,
        payload: {
          color: "white",
        },
      })
    );
    this.player2.send(
      JSON.stringify({
        type: MsgType.INIT_GAME,
        payload: {
          color: "black",
        },
      })
    );
  }

  makeMove(socket: WebSocket, move: { from: string; to: string }) {
    if (this.moveCount % 2 === 0 && socket !== this.player1) {
      return;
    }

    if (this.moveCount % 2 === 1 && socket !== this.player2) {
      return;
    }
    try {
      this.board.move(move);
    } catch (e) {
      console.log(e);
      return;
    }

    if (this.board.isGameOver()) {
      this.player1.emit(
        MsgType.GAME_OVER,
        JSON.stringify({
          type: MsgType.GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
          },
        })
      );
      this.player2.emit(
        MsgType.GAME_OVER,
        JSON.stringify({
          type: MsgType.GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
          },
        })
      );
      return;
    }

    if (this.moveCount % 2 === 0) {
      this.player2.send(
        JSON.stringify({
          type: MsgType.MOVE,
          payload: move,
        })
      );
    } else {
      this.player1.send(
        JSON.stringify({
          type: MsgType.MOVE,
          payload: move,
        })
      );
    }
    this.moveCount++;
  }
}

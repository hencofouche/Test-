import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Board } from './components/Board';
import { GameStatus } from './components/GameStatus';
import { GameOverModal } from './components/GameOverModal';
import { StartMenu } from './components/StartMenu';
import { DeckBuilder } from './components/DeckBuilder';
import { Codex } from './components/Codex';
import { Gacha } from './components/Gacha';
import { CardCreator } from './components/CardCreator';
import { PreGameSetup } from './components/PreGameSetup';
import { PlayMenu } from './components/PlayMenu';
import { ActionModal } from './components/ActionModal';
import { ReviveModal } from './components/ReviveModal';
import { GameRules } from './components/GameRules';
import { Card, CardDefinition, Player, Position, GameState, PlayerCollection, DeckArray, SavedDecks, CollectionCard, CardClassName, GameMode } from './types';
import { BOARD_SIZE, DECK_SIZE } from './constants';
import { SFX } from './utils/SoundManager';

// --- DEFAULT GAME DATA ---
const defaultMasterCardList: CardDefinition[] = [];
const defaultPlayerCollection: PlayerCollection = [];


// Main game logic and state management
const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('start');
    const [boardState, setBoardState] = useState<(Card | null)[][]>([]);
    const [currentPlayer, setCurrentPlayer] = useState<Player>('Gold');
    const [validMoves, setValidMoves] = useState<Position[]>([]);
    const [capturedCards, setCapturedCards] = useState<{ Gold: Card[]; Black: Card[] }>({ Gold: [], Black: [] });
    const [winner, setWinner] = useState<Player | null>(null);
    const [winReason, setWinReason] = useState<'capture' | 'surrender'>('capture');
    const [playerNames, setPlayerNames] = useState<{ Gold: string; Black: string }>({ Gold: 'Player 1', Black: 'Player 2' });
    const [gameMode, setGameMode] = useState<GameMode>('local');

    const [masterCardList, setMasterCardList] = useState<CardDefinition[]>(defaultMasterCardList);
    const [playerCollection, setPlayerCollection] = useState<PlayerCollection>(defaultPlayerCollection);
    const [savedDecks, setSavedDecks] = useState<SavedDecks>({});
    
    const [installPrompt, setInstallPrompt] = useState<any>(null);

    // Gameplay state
    const [selectedCardPosition, setSelectedCardPosition] = useState<Position | null>(null);
    const [actionModalInfo, setActionModalInfo] = useState<{card: Card, position: Position} | null>(null);
    const [isAbilityMove, setIsAbilityMove] = useState(false);
    
    // Ability-specific states
    const [abilityIntent, setAbilityIntent] = useState<{ card: Card; position: Position } | null>(null);
    const [extraTurns, setExtraTurns] = useState(0);
    const [isExtraTurnActive, setIsExtraTurnActive] = useState(false);
    const [guardActiveFor, setGuardActiveFor] = useState<Player | null>(null);
    const [reviveModalInfo, setReviveModalInfo] = useState<{ healer: Card; position: Position } | null>(null);
    const [placingRevivedCard, setPlacingRevivedCard] = useState<Card | null>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault(); setInstallPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        installPrompt.userChoice.then((choiceResult: { outcome: string }) => {
            if (choiceResult.outcome === 'accepted') { console.log('User accepted the install prompt'); } 
            else { console.log('User dismissed the install prompt'); }
            setInstallPrompt(null);
        });
    };

    const getInitialBoard = useCallback((goldDeck: DeckArray, blackDeck: DeckArray): (Card | null)[][] | null => {
      const processDeck = (deck: DeckArray): CardDefinition[] => {
          return deck.map(deckSlot => {
              return masterCardList.find(c => c.id === deckSlot!.cardId)!;
          });
      };
  
      const goldDeckCards = processDeck(goldDeck);
      const blackDeckCards = processDeck(blackDeck);
  
      const board: (Card | null)[][] = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
      const startCol = Math.floor((BOARD_SIZE - DECK_SIZE) / 2);
  
      for (let i = 0; i < DECK_SIZE; i++) {
          const col = startCol + i;
          const blackCardInfo = blackDeckCards[i];
          board[0][col] = { ...blackCardInfo, player: 'Black', abilityUsed: false };
          
          const goldCardInfo = goldDeckCards[i];
          board[BOARD_SIZE - 1][col] = { ...goldCardInfo, player: 'Gold', abilityUsed: false };
      }
      return board;
    }, [masterCardList]);

    const endTurn = () => {
        const performEndTurn = () => {
             if (extraTurns > 0) {
                setExtraTurns(prev => prev - 1);
                setIsExtraTurnActive(true);
            } else {
                const nextPlayer = currentPlayer === 'Gold' ? 'Black' : 'Gold';
                if (guardActiveFor === nextPlayer) {
                    setGuardActiveFor(null);
                }
                setCurrentPlayer(nextPlayer);
                setIsExtraTurnActive(false);
                SFX.turnChange();
            }
            setActionModalInfo(null);
            setSelectedCardPosition(null);
            setValidMoves([]);
            setIsAbilityMove(false);
            setPlacingRevivedCard(null);
            setAbilityIntent(null);
        };
        performEndTurn();
    };

    const calculateValidMoves = (from: Position, board: (Card | null)[][]): Position[] => {
      const moves: Position[] = [];
      const { row, col } = from;
      const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
      const card = board[row][col];
      if (!card) return [];
      for (const [dr, dc] of directions) {
          const newRow = row + dr; const newCol = col + dc;
          if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
              const destinationCard = board[newRow][newCol];
              if (!destinationCard) {
                  moves.push({ row: newRow, col: newCol });
              } else if (destinationCard.player !== card.player && guardActiveFor !== destinationCard.player) {
                  moves.push({ row: newRow, col: newCol });
              }
          }
      }
      return moves;
    };
    
    const calculateAbilityMoves = (from: Position, board: (Card | null)[][], card: Card): Position[] => {
      const moves: Position[] = [];
      const { row, col } = from;
      if (card.abilityUsed) return [];
      switch (card.className) {
        case 'Knight': {
            const directions = [[-1, 0], [1, 0]];
            for (const [dr, dc] of directions) {
                for (let i = 1; i <= 3; i++) {
                    const newRow = row + dr * i; const newCol = col + dc * i;
                    if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                        const targetCard = board[newRow][newCol];
                        if (targetCard && targetCard.player === card.player) break;
                        if (targetCard && targetCard.player !== card.player && guardActiveFor === targetCard.player) break;
                        moves.push({ row: newRow, col: newCol });
                    } else break;
                }
            }
            break;
        }
        case 'Assassin': {
            for (let r = 0; r < BOARD_SIZE; r++) { for (let c = 0; c < BOARD_SIZE; c++) { if (!board[r][c]) { moves.push({ row: r, col: c }); } } }
            break;
        }
        case 'Archer': {
             const directions = [[-2, -2], [-2, 0], [-2, 2], [0, -2], [0, 2], [2, -2], [2, 0], [2, 2], [-2, -1], [-2, 1], [2, -1], [2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2]];
             for (const [dr, dc] of directions) {
                if (Math.max(Math.abs(dr), Math.abs(dc)) !== 2) continue;
                const newRow = row + dr; const newCol = col + dc;
                if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                    const targetCard = board[newRow][newCol];
                    if (targetCard && targetCard.player !== card.player && guardActiveFor !== targetCard.player) { moves.push({ row: newRow, col: newCol }); }
                }
            }
            break;
        }
        case 'Mage': {
            const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
            for (const [dr, dc] of directions) {
                for (let i = 1; i <= 3; i++) {
                    const newRow = row + dr * i; const newCol = col + dc * i;
                    if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                        const targetCard = board[newRow][newCol];
                        if (targetCard) { if (targetCard.player !== card.player && guardActiveFor !== targetCard.player) { moves.push({ row: newRow, col: newCol }); } break; }
                    } else break;
                }
            }
            break;
        }
      }
      return moves;
    };

    const handleGameOver = (winPlayer: Player, reason: 'capture' | 'surrender') => {
        if (winner) return; // Prevent calling game over multiple times
        setWinReason(reason);
        SFX.gameOver();
        setWinner(winPlayer);
        setGameState('game_over');
    };

    const executeMove = (from: Position, to: Position, ability: CardClassName | null) => {
        const newBoard = boardState.map(r => [...r]);
        const cardToMove = { ...newBoard[from.row][from.col]! };
        if (ability) cardToMove.abilityUsed = true;

        let capturedThisTurn: Card[] = [];
        const capture = (pos: Position) => {
            const target = newBoard[pos.row][pos.col];
            if (target) {
                if (guardActiveFor === target.player) return;
                capturedThisTurn.push(target); newBoard[pos.row][pos.col] = null;
            }
        };

        if (ability === 'Knight') {
            const dr = Math.sign(to.row - from.row); const dc = Math.sign(to.col - from.col);
            let r = from.row, c = from.col;
            while(r !== to.row || c !== to.col) {
                r += dr; c += dc;
                if(newBoard[r][c]?.player !== cardToMove.player) capture({row: r, col: c});
            }
        } else if (['Assassin', 'Archer', 'Mage'].includes(ability || '') || !ability) {
             if (newBoard[to.row][to.col]) capture(to);
        }

        if (capturedThisTurn.length > 0) {
            setCapturedCards(prev => {
                const newCaps = { ...prev };
                capturedThisTurn.forEach(c => newCaps[c.player].push(c));
                return newCaps;
            });
        }
    
        if (ability && ['Knight', 'Assassin', 'Archer', 'Mage'].includes(ability)) { SFX.playAbility(ability); }
        if (capturedThisTurn.length > 0) { SFX.capture(); } 
        else if (ability !== 'Archer' && ability !== 'Mage') { SFX.move(); }

        if (ability === 'Archer' || ability === 'Mage') {
            newBoard[from.row][from.col] = cardToMove;
        } else {
            newBoard[to.row][to.col] = cardToMove; newBoard[from.row][from.col] = null;
        }
        setBoardState(newBoard);
    
        const remainingOpponentCards = newBoard.flat().filter(c => c && c.player !== currentPlayer).length;
        if (remainingOpponentCards === 0) {
            handleGameOver(currentPlayer, 'capture');
        } else { endTurn(); }
    };
    
    const handleTileClick = (row: number, col: number) => {
      if (actionModalInfo) return;
  
      if (selectedCardPosition && selectedCardPosition.row === row && selectedCardPosition.col === col) {
          handleCancelAction(); return;
      }
  
      if (placingRevivedCard) {
          if (validMoves.some(m => m.row === row && m.col === col)) {
              SFX.move(); const newBoard = boardState.map(r => [...r]);
              newBoard[row][col] = placingRevivedCard; setBoardState(newBoard); endTurn();
          }
          return;
      }
  
      if (selectedCardPosition) {
          if (validMoves.some(move => move.row === row && move.col === col)) {
              const card = boardState[selectedCardPosition.row][selectedCardPosition.col];
              executeMove(selectedCardPosition, { row, col }, isAbilityMove ? card!.className : null);
          } else {
              handleCancelAction();
          }
      } else {
          const card = boardState[row][col];
          if (card && card.player === currentPlayer) {
               if (abilityIntent) return;
              setActionModalInfo({ card, position: { row, col } });
          }
      }
  };

    const handleAbilityAction = () => {
        if (!actionModalInfo) return;
        const { card, position } = actionModalInfo;

        if (card.className === 'Thief') {
            SFX.playAbility('Thief');
            const newBoard = boardState.map(r => [...r]);
            const thiefCardOnBoard = newBoard[position.row][position.col];
            if (thiefCardOnBoard) thiefCardOnBoard.abilityUsed = true;
            setBoardState(newBoard); setExtraTurns(1); setActionModalInfo(null);
            return;
        }
        if (card.className === 'Guard') {
            SFX.playAbility('Guard');
            const newBoard = boardState.map(r => [...r]);
            const guardCardOnBoard = newBoard[position.row][position.col];
            if (guardCardOnBoard) guardCardOnBoard.abilityUsed = true;
            setBoardState(newBoard); setGuardActiveFor(currentPlayer); endTurn();
            return;
        }

        setActionModalInfo(null); setAbilityIntent({ card, position });
    
        switch (card.className) {
            case 'Healer': {
                const capturedAllies = capturedCards[currentPlayer];
                if (capturedAllies.length === 0) { alert("No captured allies to revive."); handleCancelAction(); return; }
                 const adjacentEmptySquares = calculateValidMoves(position, boardState).filter(m => !boardState[m.row][m.col]);
                 if(adjacentEmptySquares.length === 0){ alert("No empty adjacent space to revive an ally."); handleCancelAction(); return; }
                setReviveModalInfo({ healer: card, position }); break;
            }
            case 'Knight': case 'Assassin': case 'Archer': case 'Mage':
                setIsAbilityMove(true); setSelectedCardPosition(position); setValidMoves(calculateAbilityMoves(position, boardState, card)); break;
            default: handleCancelAction(); break;
        }
    };
    
    const handleReviveCardSelection = (cardToRevive: Card) => {
        if (!reviveModalInfo || !abilityIntent) return;
        SFX.playAbility('Healer');
        const newBoard = boardState.map(r => [...r]);
        const healerOnBoard = newBoard[reviveModalInfo.position.row][reviveModalInfo.position.col];
        if (healerOnBoard) healerOnBoard.abilityUsed = true;
        setBoardState(newBoard); setAbilityIntent(null);
        setCapturedCards(prev => ({ ...prev, [currentPlayer]: prev[currentPlayer].filter(c => c.id !== cardToRevive.id) }));
        setReviveModalInfo(null);
        setPlacingRevivedCard({ ...cardToRevive, player: currentPlayer, abilityUsed: false });
        const adjacentEmptySquares = calculateValidMoves(reviveModalInfo.position, boardState).filter(m => !boardState[m.row][m.col]);
        setValidMoves(adjacentEmptySquares);
    };

    const handleInitiateMove = () => {
        if (!actionModalInfo) return;
        setActionModalInfo(null); setIsAbilityMove(false);
        setSelectedCardPosition(actionModalInfo.position);
        setValidMoves(calculateValidMoves(actionModalInfo.position, boardState));
    };

    const handleCancelAction = () => {
        setActionModalInfo(null); setSelectedCardPosition(null); setValidMoves([]);
        setIsAbilityMove(false); setPlacingRevivedCard(null); setReviveModalInfo(null); setAbilityIntent(null);
    };

    const handleStartMatch = (goldPlayer: {name: string, deck: DeckArray}, blackPlayer: {name: string, deck: DeckArray}) => {
      SFX.gameStart();
      setPlayerNames({ Gold: goldPlayer.name, Black: blackPlayer.name });
      const initialBoard = getInitialBoard(goldPlayer.deck, blackPlayer.deck);
      if (initialBoard) {
          setBoardState(initialBoard); setGameState('playing'); setWinner(null);
          setCurrentPlayer('Gold'); setCapturedCards({ Gold: [], Black: [] });
          setValidMoves([]); setSelectedCardPosition(null); setGuardActiveFor(null);
          setExtraTurns(0); setIsExtraTurnActive(false);
          setWinReason('capture');
      } else { alert("An unexpected error occurred."); }
    };

    const handleSaveGame = () => {
        const gameStateData = JSON.stringify({
            masterCardList,
            playerCollection,
            savedDecks,
        });
        const blob = new Blob([gameStateData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'otakus-gambit-save.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        SFX.buttonClick();
    };
    const handleLoadGame = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result;
                    if (typeof text === 'string') {
                        const data = JSON.parse(text);
                        if (data.masterCardList && data.playerCollection && data.savedDecks) {
                            setMasterCardList(data.masterCardList);
                            setPlayerCollection(data.playerCollection);
                            setSavedDecks(data.savedDecks);
                            alert('Game loaded successfully!');
                        } else {
                            alert('Invalid save file format.');
                        }
                    }
                } catch (error) {
                    console.error("Failed to load game:", error);
                    alert('Failed to load save file.');
                }
            };
            reader.readAsText(file);
        }
        event.target.value = ''; // Reset file input
    };
    
    const handleSurrender = () => {
      SFX.buttonClick();
      const surrenderingPlayer = gameMode === 'bot' ? 'Gold' : currentPlayer;
      const winner = surrenderingPlayer === 'Gold' ? 'Black' : 'Gold';
      if (window.confirm(`Are you sure you want to surrender? ${playerNames[winner]} will win.`)) {
          handleCancelAction();
          SFX.surrender();
          handleGameOver(winner, 'surrender');
      }
    };

    const makeBotMove = useCallback(() => {
        const botPlayer: Player = 'Black';
    
        // --- AI Helper Functions ---
    
        const simulateMove = (
            board: (Card | null)[][],
            from: Position,
            to: Position,
            ability: CardClassName | null,
            currentGuard: Player | null
        ): (Card | null)[][] => {
            const newBoard = board.map(r => [...r]);
            const cardToMove = { ...newBoard[from.row][from.col]! };
            if (ability) cardToMove.abilityUsed = true;
    
            const capture = (pos: Position) => {
                const target = newBoard[pos.row][pos.col];
                if (target && currentGuard !== target.player) {
                    newBoard[pos.row][pos.col] = null;
                }
            };
    
            if (ability === 'Knight') {
                const dr = Math.sign(to.row - from.row);
                const dc = Math.sign(to.col - from.col);
                let r = from.row, c = from.col;
                while (r !== to.row || c !== to.col) {
                    r += dr; c += dc;
                    if (newBoard[r][c]?.player !== cardToMove.player) capture({ row: r, col: c });
                }
            } else if (['Assassin', 'Archer', 'Mage'].includes(ability || '') || !ability) {
                if (newBoard[to.row][to.col]) capture(to);
            }
    
            if (ability === 'Archer' || ability === 'Mage') {
                newBoard[from.row][from.col] = cardToMove;
            } else {
                newBoard[to.row][to.col] = cardToMove;
                newBoard[from.row][from.col] = null;
            }
            return newBoard;
        };
    
        const evaluateBoardState = (board: (Card | null)[][], player: Player, currentGuard: Player | null): number => {
            let score = 0;
            const opponent: Player = player === 'Gold' ? 'Black' : 'Gold';
            const PIECE_VALUE = 100;
            const POSITIONAL_BONUS = 2;
            const THREAT_BONUS = 15;
            const DANGER_PENALTY = -20;
    
            const playerPieces: { card: Card; pos: Position }[] = [];
            const opponentPieces: { card: Card; pos: Position }[] = [];
    
            board.forEach((row, r) => {
                row.forEach((card, c) => {
                    if (card) {
                        if (card.player === player) playerPieces.push({ card, pos: { row: r, col: c } });
                        else opponentPieces.push({ card, pos: { row: r, col: c } });
                    }
                });
            });
    
            score += playerPieces.length * PIECE_VALUE;
            score -= opponentPieces.length * PIECE_VALUE;
    
            const centerBonus = (pos: Position) => (3.5 - Math.abs(pos.row - 3.5)) + (3.5 - Math.abs(pos.col - 3.5));
    
            playerPieces.forEach(p => {
                score += centerBonus(p.pos) * POSITIONAL_BONUS;
                const moves = calculateValidMoves(p.pos, board);
                moves.forEach(move => {
                    if (board[move.row][move.col]?.player === opponent) score += THREAT_BONUS;
                });
            });
    
            opponentPieces.forEach(p => {
                score -= centerBonus(p.pos) * POSITIONAL_BONUS;
                const moves = calculateValidMoves(p.pos, board);
                moves.forEach(move => {
                    if (board[move.row][move.col]?.player === player) score += DANGER_PENALTY;
                });
            });
    
            return score;
        };
    
        // --- Main AI Logic ---
    
        const potentialActions: { score: number; action: () => void; description: string }[] = [];
        const currentScore = evaluateBoardState(boardState, botPlayer, guardActiveFor);
    
        boardState.forEach((row, r) => {
            row.forEach((card, c) => {
                if (card && card.player === botPlayer) {
                    const from = { row: r, col: c };
    
                    // 1. Evaluate standard moves
                    calculateValidMoves(from, boardState).forEach(to => {
                        const newBoard = simulateMove(boardState, from, to, null, guardActiveFor);
                        const score = evaluateBoardState(newBoard, botPlayer, guardActiveFor);
                        potentialActions.push({
                            score,
                            action: () => executeMove(from, to, null),
                            description: `Move ${card.name} to (${to.row},${to.col})`,
                        });
                    });
    
                    // 2. Evaluate ability moves
                    if (!card.abilityUsed) {
                        if (['Knight', 'Assassin', 'Archer', 'Mage'].includes(card.className)) {
                            calculateAbilityMoves(from, boardState, card).forEach(to => {
                                const newBoard = simulateMove(boardState, from, to, card.className, guardActiveFor);
                                const score = evaluateBoardState(newBoard, botPlayer, guardActiveFor);
                                potentialActions.push({
                                    score,
                                    action: () => executeMove(from, to, card.className),
                                    description: `Ability ${card.className} to (${to.row},${to.col})`,
                                });
                            });
                        } else if (card.className === 'Guard') {
                            let threatenedPieces = 0;
                            boardState.flat().forEach(piece => {
                                if (piece?.player === botPlayer) {
                                    const opponentCanCapture = boardState.flat().some(opp =>
                                        opp?.player === 'Gold' && calculateValidMoves(opp, boardState).some(m => m.row === piece.pos.row && m.col === piece.pos.col)
                                    );
                                    if(opponentCanCapture) threatenedPieces++;
                                }
                            });
                            const score = currentScore + (threatenedPieces >= 2 ? 75 : 0);
                            if (threatenedPieces >= 2) {
                                potentialActions.push({
                                    score,
                                    action: () => {
                                        SFX.playAbility('Guard');
                                        const newBoard = boardState.map(b_r => [...b_r]);
                                        const guardCardOnBoard = newBoard[r][c];
                                        if (guardCardOnBoard) guardCardOnBoard.abilityUsed = true;
                                        setBoardState(newBoard); setGuardActiveFor(botPlayer); endTurn();
                                    },
                                    description: `Ability Guard`,
                                });
                            }
                        } else if (card.className === 'Thief') {
                             calculateValidMoves(from, boardState).forEach(to => {
                                const boardAfterMove = simulateMove(boardState, from, to, null, guardActiveFor);
                                const score = evaluateBoardState(boardAfterMove, botPlayer, guardActiveFor) + 40; // Bonus for extra turn
                                potentialActions.push({
                                    score,
                                    action: () => {
                                        SFX.playAbility('Thief');
                                        const newBoard = boardState.map(br => [...br]);
                                        const thiefCardOnBoard = newBoard[from.row][from.col];
                                        if (thiefCardOnBoard) thiefCardOnBoard.abilityUsed = true;
                                        setBoardState(newBoard);
                                        setExtraTurns(1); 
                                        executeMove(from, to, null);
                                    },
                                    description: `Ability Thief Combo to (${to.row},${to.col})`
                                });
                            });
                        } else if (card.className === 'Healer') {
                            const capturedAllies = capturedCards[botPlayer];
                            const adjacentEmptySquares = calculateValidMoves(from, boardState).filter(m => !boardState[m.row][m.col]);
                            if (capturedAllies.length > 0 && adjacentEmptySquares.length > 0) {
                                const score = currentScore + 90;
                                potentialActions.push({
                                    score,
                                    action: () => {
                                        SFX.playAbility('Healer');
                                        const newBoard = boardState.map(b_r => [...b_r]);
                                        const healerOnBoard = newBoard[r][c];
                                        if (healerOnBoard) healerOnBoard.abilityUsed = true;
                                        
                                        const cardToRevive = capturedAllies[0];
                                        const placeAt = adjacentEmptySquares[0];
                                        newBoard[placeAt.row][placeAt.col] = { ...cardToRevive, player: botPlayer, abilityUsed: false };

                                        setBoardState(newBoard);
                                        setCapturedCards(prev => ({ ...prev, [botPlayer]: prev[botPlayer].slice(1) }));
                                        endTurn();
                                    },
                                    description: `Ability Healer`,
                                });
                            }
                        }
                    }
                }
            });
        });
    
        if (potentialActions.length > 0) {
            potentialActions.sort((a, b) => b.score - a.score);
            // console.log("Bot considered moves:", potentialActions.map(p => `${p.description} (Score: ${p.score.toFixed(2)})`));
            potentialActions[0].action();
        } else {
            endTurn();
        }
    }, [boardState, currentPlayer, gameMode, winner, capturedCards, guardActiveFor, calculateValidMoves, calculateAbilityMoves]);


    useEffect(() => {
        const isBotTurn = gameMode === 'bot' && currentPlayer === 'Black';
        if (gameState === 'playing' && !winner && isBotTurn) {
            const timer = setTimeout(makeBotMove, 1500);
            return () => clearTimeout(timer);
        }
    }, [currentPlayer, gameState, gameMode, winner, boardState, makeBotMove]);
    
    // --- Game Mode Selection ---
    const handleSelectLocal = () => { setGameMode('local'); setGameState('pre_game'); };
    const handleSelectBot = () => {
        if (Object.keys(savedDecks).length === 0) { alert("Create a deck first!"); return; }
        setGameMode('bot'); setGameState('pre_game');
    };
    
    const resetToMenu = () => {
        setGameState('start');
    };
    
    const handleCreateCard = (className: CardClassName, name: string, image: string | undefined) => {
        const newCard: CardDefinition = {
          id: `card_${Date.now()}_${name.replace(/\s+/g, '_')}`,
          className,
          name,
          image,
        };
        setMasterCardList(prev => [...prev, newCard]);
        const newCollectionCard: CollectionCard = {
            instanceId: `coll_${newCard.id}_${Date.now()}`,
            cardId: newCard.id,
        };
        setPlayerCollection(prev => [...prev, newCollectionCard]);
    };

    const handleSaveNamedDeck = (name: string, deck: DeckArray): boolean => {
        if (!name.trim()) {
            alert("Deck name cannot be empty.");
            return false;
        }
        if (savedDecks[name] && !window.confirm(`A deck named "${name}" already exists. Overwrite it?`)) {
            return false;
        }
        setSavedDecks(prev => ({ ...prev, [name]: deck }));
        alert(`Deck "${name}" saved!`);
        return true;
    };
    const handleDeleteDeck = (name: string) => {
        if (window.confirm(`Are you sure you want to delete the deck "${name}"?`)) {
            setSavedDecks(prev => {
                const newDecks = { ...prev };
                delete newDecks[name];
                return newDecks;
            });
        }
    };
    const handleDrawPack = (): CardDefinition[] => {
        if (masterCardList.length === 0) return [];
        
        const PACK_SIZE = 4;
        const drawnCards: CollectionCard[] = [];
        const drawnCardDefinitions: CardDefinition[] = [];
    
        for (let i = 0; i < PACK_SIZE; i++) {
            const randomCardDef = masterCardList[Math.floor(Math.random() * masterCardList.length)];
            const newInstance: CollectionCard = {
                instanceId: `coll_${randomCardDef.id}_${Date.now()}_${i}`,
                cardId: randomCardDef.id,
            };
            drawnCards.push(newInstance);
            drawnCardDefinitions.push(randomCardDef);
        }
        
        setPlayerCollection(prev => [...prev, ...drawnCards]);
        return drawnCardDefinitions;
    };
    
    const renderContent = () => {
        switch(gameState) {
            case 'start': return <StartMenu onPlay={() => setGameState('play_menu')} onDeckBuilder={() => setGameState('deck_builder')} onGacha={() => setGameState('gacha')} onCodex={() => setGameState('codex')} onCreator={() => setGameState('creator')} onRules={() => setGameState('rules')} onSave={handleSaveGame} onLoad={handleLoadGame} onInstall={handleInstallClick} canInstall={!!installPrompt} />;
            case 'play_menu': return <PlayMenu onBot={handleSelectBot} onLocal={handleSelectLocal} onBack={() => setGameState('start')} />;
            case 'pre_game': return <PreGameSetup isBotMatch={gameMode === 'bot'} savedDecks={savedDecks} onStartMatch={handleStartMatch} onBack={() => setGameState('play_menu')} />;
            case 'deck_builder': return <DeckBuilder collection={playerCollection} masterCardList={masterCardList} savedDecks={savedDecks} onSaveNamedDeck={handleSaveNamedDeck} onDeleteDeck={handleDeleteDeck} onBack={() => setGameState('start')} />;
            case 'gacha': return <Gacha onDrawPack={handleDrawPack} onBack={() => setGameState('start')} />;
            case 'codex': return <Codex cards={masterCardList} collection={playerCollection} onBack={() => setGameState('start')} />;
            case 'creator': return <CardCreator onCreateCard={handleCreateCard} onBack={() => setGameState('start')} masterCardList={masterCardList} />;
            case 'rules': return <GameRules onBack={() => setGameState('start')} />;
            case 'playing': case 'game_over':
                return (
                    <div className="flex flex-col items-center">
                        <GameStatus currentPlayer={currentPlayer} capturedCards={capturedCards} playerNames={playerNames} />
                        <Board boardState={boardState} currentPlayer={currentPlayer} validMoves={validMoves} selectedCardPosition={selectedCardPosition} onTileClick={handleTileClick} guardActiveFor={guardActiveFor} abilityIntent={abilityIntent ? abilityIntent.card : null} />
                         {gameState === 'playing' && ( <button onClick={handleSurrender} className="mt-6 px-8 py-3 bg-red-800 text-white font-bold text-lg rounded-lg hover:bg-red-700 transition-colors"> Surrender </button> )}
                         {actionModalInfo && <ActionModal cardInfo={actionModalInfo} onMove={handleInitiateMove} onUseAbility={handleAbilityAction} onCancel={handleCancelAction} isExtraTurn={isExtraTurnActive || extraTurns > 0} />}
                         {reviveModalInfo && <ReviveModal capturedCards={capturedCards[currentPlayer]} onRevive={handleReviveCardSelection} onCancel={handleCancelAction} />}
                        <GameOverModal winner={winner} onRestart={resetToMenu} playerNames={playerNames} winReason={winReason} />
                    </div>
                );
        }
    };

    return (
        <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-amber-900/50 opacity-50"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%3...')] opacity-20"></div>
            <div className="relative z-10 w-full flex flex-col items-center">{renderContent()}</div>
        </main>
    );
}

export default App;

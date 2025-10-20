// ELO calculation and storage
const K_FACTOR = 32;
const DEFAULT_ELO = 1200;

export const getPlayerElo = (): number => {
    const elo = localStorage.getItem('playerElo');
    return elo ? parseInt(elo, 10) : DEFAULT_ELO;
};

export const setPlayerElo = (elo: number): void => {
    localStorage.setItem('playerElo', elo.toString());
};

/**
 * Calculates the new ELO ratings for two players after a match.
 * @param playerA_Elo - ELO of Player A
 * @param playerB_Elo - ELO of Player B
 * @param resultA - The result for Player A: 1 for a win, 0.5 for a draw, 0 for a loss.
 * @returns An object with the new ELO for both players and the change for player A.
 */
export const calculateEloChange = (playerA_Elo: number, playerB_Elo: number, resultA: 1 | 0.5 | 0): { newPlayerA_Elo: number, newPlayerB_Elo: number, change: number } => {
    const expectedScoreA = 1 / (1 + Math.pow(10, (playerB_Elo - playerA_Elo) / 400));
    const expectedScoreB = 1 - expectedScoreA;

    const resultB = 1 - resultA;

    const newPlayerA_Elo = Math.round(playerA_Elo + K_FACTOR * (resultA - expectedScoreA));
    const newPlayerB_Elo = Math.round(playerB_Elo + K_FACTOR * (resultB - expectedScoreB));
    
    const change = newPlayerA_Elo - playerA_Elo;

    return { newPlayerA_Elo, newPlayerB_Elo, change };
};

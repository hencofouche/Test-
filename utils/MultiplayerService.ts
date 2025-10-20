// This service handles the real-time communication with Supabase for multiplayer matches.
import { CardClassName, Player, Position, DeckArray } from '../types';

// IMPORTANT: Replace this with your own Supabase project's URL and anon key!
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export type MovePayload = {
    from: Position;
    to: Position;
    ability: CardClassName | null;
};

type EventHandler = (...args: any[]) => void;

// Supabase is loaded from a script tag in index.html
declare const supabase: any;

export class MultiplayerService {
    private client: any;
    private listeners: Map<string, EventHandler[]> = new Map();
    private gameId: string | null = null;
    private playerUid: string | null = null;
    private playerColor: Player | null = null;
    private realtimeChannel: any = null;

    constructor() {
        if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
            throw new Error("Supabase URL is not configured in MultiplayerService.ts");
        }
        if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
            throw new Error("Supabase anon key is not configured in MultiplayerService.ts");
        }
        this.client = supabase.createClient(supabaseUrl, supabaseAnonKey);
    }
    
    // --- Event Emitter Implementation ---
    on(event: string, callback: EventHandler): void {
        if (!this.listeners.has(event)) { this.listeners.set(event, []); }
        this.listeners.get(event)?.push(callback);
    }

    off(event: string, callback: EventHandler): void {
        const cbs = this.listeners.get(event);
        if (cbs) { this.listeners.set(event, cbs.filter(cb => cb !== callback)); }
    }

    private emit(event: string, ...args: any[]): void {
        this.listeners.get(event)?.forEach(cb => cb(...args));
    }

    // --- Core Service Logic ---
    async connect(): Promise<void> {
        try {
            // With Supabase, the client is always "connected". We can emit this immediately.
            this.emit('connected');
        } catch (error) {
            console.error("Supabase client creation error:", error);
            this.emit('error', 'Failed to connect to the server.');
        }
    }

    async findMatch(playerElo: number, playerDeck: DeckArray): Promise<void> {
        // 1. Add myself to the matchmaking queue
        const myName = "Player " + Math.floor(Math.random() * 1000);
        const { data: myQueueEntry, error: insertError } = await this.client
            .from('matchmaking_queue')
            .insert({ name: myName, elo: playerElo, deck: playerDeck })
            .select()
            .single();

        if (insertError) {
            console.error("Error entering queue:", insertError);
            this.emit('error', 'Could not enter matchmaking.');
            return;
        }
        
        this.playerUid = myQueueEntry.uid;

        // 2. Look for an opponent in the queue
        const { data: opponents, error: fetchError } = await this.client
            .from('matchmaking_queue')
            .select('*')
            .not('uid', 'eq', this.playerUid)
            .order('created_at', { ascending: true })
            .limit(1);

        if (fetchError) {
            console.error("Error finding opponent:", fetchError);
            this.emit('error', 'Error while searching for opponent.');
            return;
        }

        if (opponents && opponents.length > 0) {
            // --- Opponent found, create the game ---
            const opponent = opponents[0];

            // 3. Create the game room
            const players = {
                Gold: { uid: this.playerUid, name: myName, elo: playerElo, deck: playerDeck },
                Black: { uid: opponent.uid, name: opponent.name, elo: opponent.elo, deck: opponent.deck }
            };
            
            const { data: newGame, error: gameCreationError } = await this.client
                .from('games')
                .insert({ players })
                .select()
                .single();

            if (gameCreationError) {
                console.error("Error creating game:", gameCreationError);
                this.emit('error', 'Could not create the match.');
                return;
            }

            // 4. Update both players in the queue to link them to the game
            // This transactionally informs both players they are matched.
            await this.client.from('matchmaking_queue').update({ game_id: newGame.id }).eq('uid', this.playerUid);
            await this.client.from('matchmaking_queue').update({ game_id: newGame.id }).eq('uid', opponent.uid);
            
            // The creator (me) can now join the game
            this.joinGame(newGame.id, 'Gold', players.Black);

        } else {
            // --- No opponent found, wait to be matched ---
            // Subscribe to my own queue entry. When an opponent finds me, they will update it with a game_id.
            this.client.channel(`queue-${this.playerUid}`)
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matchmaking_queue', filter: `uid=eq.${this.playerUid}` },
                    async (payload: any) => {
                        if (payload.new.game_id) {
                            const { data: game, error } = await this.client.from('games').select('*, players').eq('id', payload.new.game_id).single();
                            if(error) { console.error(error); this.emit('error', 'Failed to fetch match details.'); return; }
                            
                            this.joinGame(game.id, 'Black', game.players.Gold);
                        }
                    }
                ).subscribe();
        }
    }
    
    private joinGame(gameId: string, playerColor: Player, opponent: any) {
        this.gameId = gameId;
        this.playerColor = playerColor;
        
        // Clean up queue subscriptions
        this.client.removeChannel(this.client.channel(`queue-${this.playerUid}`));
        
        // Announce match found to the UI
        this.emit('match_found', {
            opponent: { name: opponent.name, elo: opponent.elo, deck: opponent.deck },
            playerAssignment: playerColor
        });

        // Subscribe to the game room for real-time updates
        this.realtimeChannel = this.client.channel(`game-${this.gameId}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${this.gameId}` }, 
            (payload: any) => {
                const gameData = payload.new;
                
                // Opponent's move
                if (gameData.last_move && gameData.last_move.player !== this.playerColor) {
                    this.emit('move_made', gameData.last_move);
                }
                
                // Game over
                if (gameData.winner && !payload.old.winner) {
                     this.emit('game_over', { winner: gameData.winner, reason: gameData.win_reason });
                }
            })
            .subscribe();
            
        // Clean up the queue
        this.client.from('matchmaking_queue').delete().eq('uid', this.playerUid).then();
    }

    async sendMove(player: Player, payload: MovePayload): Promise<void> {
        if (!this.gameId) return;
        await this.client
            .from('games')
            .update({ last_move: { player, move: payload }})
            .eq('id', this.gameId);
    }
    
    async sendSurrender(player: Player): Promise<void> {
        if (!this.gameId) return;
        const winner = player === 'Gold' ? 'Black' : 'Gold';
        await this.client
            .from('games')
            .update({ winner: winner, win_reason: 'surrender' })
            .eq('id', this.gameId);
    }

    disconnect(): void {
        if (this.realtimeChannel) {
            this.client.removeChannel(this.realtimeChannel);
            this.realtimeChannel = null;
        }
        if (this.playerUid) {
            // Make sure to remove myself from the queue if I cancel
            this.client.from('matchmaking_queue').delete().eq('uid', this.playerUid).then();
        }
        this.listeners.clear();
    }
}
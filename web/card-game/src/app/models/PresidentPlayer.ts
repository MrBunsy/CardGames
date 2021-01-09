import { CardPlayer } from "./declaration-whist-player";



export interface PresidentPlayer extends CardPlayer{

    /**
     * Provide list of all other players, in their play order
     * @param allPlayers 
     */
    startRound(allPlayers: PresidentPlayer[]);

}
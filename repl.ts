// repl.ts
import { stdout } from 'process';
import * as readline from 'readline';
//import {State} from "./state"
import { State, CLICommand } from "./state.js"; 



    
export function cleanInput(input: string): string[] {
    return input
      .toLowerCase()
      .trim()
      .split(" ")
      .filter((word) => word !== "");
  }
  

export async function startREPL(state: State) {
state.readlineInterface.prompt()
state.readlineInterface.on('line', async (input: string) => {
    const newWord = cleanInput(input)
    if (newWord.length === 0) {
        state.readlineInterface.prompt();
        return;
    }
    
    const commandName = newWord[0];
    const command  = state.commands[commandName]

    if(command){
        try{
            await command.callback(state, ...newWord.slice(1));
        }catch(err){
            console.log("Error running command:", err)
        }
    }else{
        console.log("Unknown command")
    }
    
    state.readlineInterface.prompt()
    return
   
  }); 
   
  
}
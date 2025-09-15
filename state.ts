import { createInterface, type Interface } from "readline";
import * as readline from 'readline';
import { stdout } from 'process';
//import {Cache} from './pokecache' 
import {Cache} from './pokecache.js'
import { Console } from "console";


//state.ts
export type Pokemon = {
  name: string;
  base_experience: number;
  // Add other properties you might need
};
export class PokeAPI {
  private static readonly baseURL = "https://pokeapi.co/api/v2";
  private cache: Cache;

  constructor(cacheInterval: number) {
    this.cache = new Cache(cacheInterval)
  }

  async fetchLocations(locationName: string): Promise<ShallowLocations> {
    const url = `${PokeAPI.baseURL}/location-area/${locationName}`;
    const cachedData = this.cache.get(url);

    if(cachedData) {
        console.log("📋 Using cached data for:", locationName);
        return cachedData.val;
    }
    
    console.log("🌐 Fetching from network:", locationName);

    const response = await fetch(url,{
      method: 'GET',
      headers:{
        "Content-Type": "application/json",
      }


    })
    const data = await response.json()
    this.cache.add(url,data)

    return data

  }

  async fetchLocation(locationName: string): Promise<Location> {
    const url = `${PokeAPI.baseURL}/location-area/${locationName}`;
    const cachedData = this.cache.get(url);

    if(cachedData) {
        console.log("📋 Using cached data for:", locationName);
        return cachedData.val;
    }
    const response = await fetch(url,{
      method:"GET",
      headers:{
        "Content-Type": "application/json",
      }
    })
    const data = await response.json() as Location
    this.cache.add(url,data)

    return data
  }
  async fetchPokemon(pokemonName: string): Promise<Pokemon> {
    const url = `${PokeAPI.baseURL}/pokemon/${pokemonName}`;
    const cachedData = this.cache.get(url);

      if(cachedData) {
        console.log("📋 Using cached data for:", pokemonName);
        return cachedData.val;
    }
    const response = await fetch(url,{
      method:"GET",
      headers:{
        "Content-Type": "application/json",
      }
    })
    const data = await response.json() as Pokemon
    this.cache.add(url,data)

    return data
  }
    


// ...other imports...

const readlineInterface = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "Pokedex > "
});

const commands: Record<string, CLICommand> = { /* ... */ };
const PokeAPIInstance = new PokeAPI(60000);
const nextLocationsURL: string | null = null;
const prevLocationsURL: string | null = null;
const callback = async (state: State) => {};

const state: State = {
  readlineInterface,
  commands,
  pokeAPI: PokeAPIInstance,
  nextLocationsURL,
  prevLocationsURL,
  callback
};

export type ShallowLocations = {
  count:  number;
  next: string | null;
  previous: string | null;
  results:{
    name: string;
    url: string;
  }[]
};

export type Location = {
  id: number,
  name: string,
  game_index: number,
  encounter_method_rates:{
    encounter_method:{
      name:string;
      url:string
    }
    version_details: any[]
  }[]
  location:{
    name:string,
    url:string
  }
  names:{
    name:string,
    language:{
      name: string;
      url: string
    }
  }[]
  pokemon_encounters: {
    pokemon: {
      name: string;
      url: string;
    };
    version_details: any[];
  }[];
};
export async function commandExit(state: State, ...args: string[]){
    state.readlineInterface.close()
    console.log("Closing the Pokedex... Goodbye!")
    process.exit(0)
};
export async function commandMap(state: State, ...args: string[]){
  const locs = await state.pokeAPI.fetchLocations("test")
  for(const loc of locs.results){
    console.log(loc.name)
  }
  state.nextLocationsURL = locs.next
  state.prevLocationsURL = locs.previous
}
export async function commandMapb(state: State, ...args: string[]){
  const firstPage = "you're on the first page"
  if(!state.prevLocationsURL){
    console.log(firstPage)
    return
  }
  const locs = await state.pokeAPI.fetchLocations(state.prevLocationsURL)
  for(const loc of locs.results){
    console.log(loc.name)
  }
  state.nextLocationsURL = locs.next
  state.prevLocationsURL = locs.previous
}

export async function commandExplore(state: State, ...args: string[]){
  const locationName = args[0];
  if(!locationName){
    console.log("Please provide a location name")
    return
  }

  console.log(`Exploring ${locationName}...`)

  try{
    const locationData = await state.pokeAPI.fetchLocation(locationName);

    const encounters = locationData.pokemon_encounters

    console.log("Found Pokemon...");
    for(const encounter of encounters){
      console.log(`${encounter.pokemon.name}`)
    }

  }catch(error){
    console.log(`Error exploring ${locationName}:`,error)

  }
}

export async function commandCatch(state: State, ...args: string[]){
  const pokemonName = args[0]

  if(!pokemonName){
    console.log("Please provide a Pokemon name")
    return
  }
  console.log(`Throwing a Pokeball at ${pokemonName}`)
  try{
    const pokemon = await state.pokeAPI.fetchPokemon(pokemonName)
    const randomNumba = Math.random()
    const catchChance = 1 - (pokemon.base_experience / 500)
    if(catchChance>randomNumba){
      console.log(`You've caught ${pokemonName}!`)
      state.pokedex[pokemonName] = pokemon;
    }else{
      console.log(`${pokemonName} escaped!`)
    }

}catch(error){
  console.log(`Could not find Pokemon ${pokemonName}:`)
}
}
  
export type CLICommand = {
    name: string;
    description: string;
    //callback: (commands: Record<string, CLICommand>) => void;
    callback: (state: State, ...args: string[]) => Promise<void>;
  };

  export function getCommands(): Record<string, CLICommand> {
    return {
      exit: {
        name: "exit",
        description: "Exits the pokedex",
        callback: commandExit,
      },
      help: {
        name: "help",
        description: "Displays a help message",
        callback: commandExit,
      },
      map: {
        name: "map",
        description: "Displays the next 20 locations",
        callback: commandMap,
      },
      mapb:{
        name:"mapb",
        description: "Displays the previous 20 locations",
        callback: commandMapb,
      },
      explore:{
        name:"explore",
        description: 'takes the name of a location as a argument and returns all the pokemon in a givem area',
        callback: commandExplore,
      },
      catch:{
        name:"catch",
        description:"attempts to catch a pokemon",
        callback:commandCatch,
      },
    };
  }

  
  export type State={
    readlineInterface: Interface;
    commands:Record<string, CLICommand>;
    pokeAPI:PokeAPI;
    nextLocationsURL: ShallowLocations["next"],
    prevLocationsURL: ShallowLocations["previous"]
    pokedex: Record<string, Pokemon>;
    callback: (state: State) => Promise<void>
    }
    
    

    export function initState(): State {
      const rl = readline.createInterface({
          input: process.stdin,
          output: stdout,
          prompt: "Pokedex > "
      });
      const commands = getCommands();
      return {
          readlineInterface: rl,
          commands: commands,
          pokeAPI: new PokeAPI(60000),
          nextLocationsURL: null,
          prevLocationsURL: null,
          pokedex:{},
          callback: async () => {},
      };
  }
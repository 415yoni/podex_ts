//pokecache.ts

export type CacheEntry<T> = {
    createdAt: number,
    val: T
}

export class Cache {
    #cache = new Map<string, CacheEntry<any>>();
    #reapInteralId: NodeJS.Timeout | undefined = undefined;
    #interval: number;

    constructor(num: number){
        this.#interval = num;
        this.#startReapLoop()

    }

    #reap(){
        for(const [key,entry] of this.#cache.entries()){
            if(entry.createdAt < (Date.now()-this.#interval)){
                this.#cache.delete(key)
            }
        }
    }

    #startReapLoop(){
       this.#reapInteralId=  setInterval(()=> this.#reap(), this.#interval)
    }

    stopReapLoop(){
        clearInterval(this.#reapInteralId);
        this.#reapInteralId = undefined
    }
    add<T>(key: string, val: T){
        const entry: CacheEntry<T> = {
            createdAt: Date.now(),
            val: val
        }
        this.#cache.set(key,entry)
    }

    get<T>(key: string){
        const entry = this.#cache.get(key)
        if(!entry){
            return undefined
        }
        return entry
        
    }
   
  }
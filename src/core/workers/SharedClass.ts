// SharedClass.ts
export class SharedClass {
    constructor(public value: number) {}
  
    public add(input: number): number {
      return this.value + input;
    }
  }
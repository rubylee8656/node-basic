import myPerson, { a, f } from './person.mjs';

const p2 = new myPerson('Joe', 28);

console.log(p2.toString());
console.log({ a });
console.log(f(8));
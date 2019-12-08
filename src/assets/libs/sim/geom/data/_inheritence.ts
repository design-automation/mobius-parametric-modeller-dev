/**
 * Typescript does not support multipple inheritence.
 * Instead, the same can be achieved using mixins, as shown below.
 * The Geom classes in the folder follow this approach.
 */

class Base {
    protected data = 0;
    constructor(num: number) {
        this.data = num;
    }
}

class A extends Base {
    add1() {
        this.data += 1;
        return this.data;
    }
}

class B extends Base {
    add2() {
        this.data += 2;
        return this.data;
    }
}

class C extends Base { // and A and B
    add3() {
        this.add1();
        this.add2();
        return this.data;
    }
}

interface C extends A, B {}
applyMixins(C, [A, B]);

const c = new C(100);
console.log(c.add1());
console.log(c.add2());
console.log(c.add3());

export function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            const attribs = Object.getOwnPropertyDescriptor(
                baseCtor.prototype, name) as PropertyDescriptor;
            Object.defineProperty(
                derivedCtor.prototype,
                name,
                attribs
            );
        });
    });
}

const VOWELS = ['a', 'e', 'i', 'o', 'u', 'á', 'é', 'í', 'ó', 'ú'];
const LENITABLE_CONSONANTS = ['b', 'c', 'd', 'f', 'g', 'm', 'p', 's', 't'];
const NON_LENITABLE_CLUSTERS = ['p', 't', 'c', 'h'];

const ECLIPSIS: any = {
    'b': 'm',
    'c': 'g',
    'd': 'n',
    'f': 'bh',
    'g': 'n',
    'p': 'b',
    't': 'd'
};

const POWERS_OF_THOUSAND = ['', 'míle', 'milliún', 'billiún', 'trilliún', 'cuaidrilliún', 'cuintilliún', 'seisilliún'];

function lenite(s: string): string {
    const firstLetter = s[0];
    if (NON_LENITABLE_CLUSTERS.includes(s[1])) {
        return s;
    }

    if (LENITABLE_CONSONANTS.includes(firstLetter.toLocaleLowerCase())) {
        return firstLetter + "h" + s.slice(1);
    }

    return s;
}

function dontMutate(s: string): string {
    return s;
}
    
function eclipse(s: string): string {
    const firstLetter = s[0];
    if (VOWELS.includes(firstLetter.toLocaleLowerCase())) {
        return 'n-' + s;
    }

    if (ECLIPSIS[firstLetter]) {
        return ECLIPSIS[firstLetter] + s;
    }

    return s;
}

function hPrefix(s: string): string {
    if (VOWELS.includes(s[0].toLocaleLowerCase())) {
        return 'h' + s;
    }

    return s;
}

interface NumberForm {
    plain: string,
    counting: string,
    tens: string,
    mutation: (s: string) => (string),
}

// I think the counting forms mutate slightly differently with normal nouns
// and with céad and míle, but I'll just use the number rules for now
const numberForms: NumberForm[] = [
    {plain: "", counting: "", tens: "", mutation: dontMutate}, 
    {plain: "a haon", counting: "", tens: "a deich", mutation: dontMutate}, 
    {plain: "a dó", counting: "dhá", tens: "fiche", mutation: lenite},
    {plain: "a trí", counting: "trí", tens: "tríocha", mutation: lenite},
    {plain: "a ceathair", counting: "ceithre", tens: "daichead", mutation: lenite},
    {plain: "a cúig", counting: "cúig", tens: "caoga", mutation: lenite},
    {plain: "a sé", counting: "sé", tens: "seasca", mutation: lenite},
    {plain: "a seacht", counting: "seacht", tens: "seachtó", mutation: eclipse},
    {plain: "a hocht", counting: "ocht", tens: "ochtó", mutation: eclipse},
    {plain: "a naoi", counting: "naoi", tens: "nócha", mutation: eclipse},
];

function reverseDigits(n: number): number[] {
    return Array.from(n.toString())
                .map(Number)
                .reverse();
}

class IrishNumber {
    value: number;
    plain: string;
    counting: string;
    tens: string;
    mutation: (s: string) => string;

    constructor(n: number) {
        this.value = n;
        let forms = numberForms[n];
        this.plain = forms.plain;
        this.counting = forms.counting;
        this.tens = forms.tens;
        this.mutation = forms.mutation;
    }
}

class Triplet {
    value: number;
    one: IrishNumber;
    ten: IrishNumber;
    hundred: IrishNumber;

    constructor(n: number) {
        this.value = n;
        let digits = reverseDigits(n);
        this.one = new IrishNumber(digits[0] ?? 0);
        this.ten = new IrishNumber(digits[1] ?? 0);
        this.hundred = new IrishNumber(digits[2] ?? 0);
    }
        
    public isZero(): boolean {
        return this.value === 0;
    }

    public hasTeen(): boolean {
        return this.ten.value == 1 && this.one.value != 0;
    }

    public hasMultipleOfTen(): boolean {
        return this.ten.value != 0 && this.one.value == 0;
    }

    public hasMultipleOfHundred(): boolean {
        return this.hundred.value != 0 && this.ten.value == 0 && this.one.value == 0;
    }
}

function tripletize(n: number): Triplet[] {
    let digits = reverseDigits(n);
    let triplets: Triplet[] = [];

    // This feels like a very messy way of doing things
    for (let i = 0; i < digits.length; i += 3) {
        let number = Number(digits.slice(i, i+3).reverse().join(""));
        console.log("Number: ", number)
        triplets.push(new Triplet(number));
    }
    return triplets;
}

function irishForTriplet(n: Triplet, counter?: string): string {
    console.log("Irish for triplet new starting, n.value: ", n.value);
    let text = "";
    if (n.value == 0) {
        return "";
    }
    console.log("test 2");
    if (counter) {
        console.log("Counter is true");
        if (n.hundred.value) {
            console.log("n.hundred is true, n.hundred: ", n.hundred);
            text = n.hundred.counting + " " + n.hundred.mutation("céad")
            if (n.hasMultipleOfHundred()) {
                text += ' ' + n.ten.tens + ' ' + counter
            } else if (n.hasMultipleOfTen()) { // e.g. 110
                // Including here an exception to change the base form of *a deich* to the counting form of *deich*
                text += ' is ' + (n.ten.tens === "a deich" ? "deich" : n.ten.tens) + ' ' + counter
            } else if (n.hasTeen()) { // e.g. 112
                text += ' is ' + n.one.counting + ' ' + n.one.mutation(counter) + ((counter === 'míle') ? ' dhéag' : ' déag');
            } else { // e.g. 121
                console.log("other: ");
                text += ' ' + n.ten.tens + ' is ' + n.one.counting + ' ' + n.one.mutation(counter)
            }
        } else {
            console.log("n.hundred is not true");
            if (n.hasTeen()) { // e.g. 13
                console.log("n.hasTeen");
                text = n.one.counting + ' ' + n.one.mutation(counter) + ((counter === 'míle') ? ' dhéag' : ' déag');
                console.log("text: ", text);
            } else if (n.hasMultipleOfTen()) {
                // Including here an exception to change the base form of *a deich* to the counting form of *deich*
                text = (n.ten.tens === "a deich" ? "deich" : n.ten.tens) + ' ' + counter;
            } else if (n.ten.value) { // e.g. 54
                text = n.one.counting + ' ' + n.one.mutation(counter) + ' is ' + n.ten.tens;
            } else {
                text = n.one.counting + ' ' + n.one.mutation(counter)
            }
        }
    } else {
        console.log("COunter is not true");
        text = n.one.plain;
        if (n.hasTeen()) { // Teens
            text += (n.one.value === 2) ? ' dhéag' : ' déag';
        } 

        else if (n.ten.value) { // Multiples of 10
            console.log("N1: " + n.ten);
            text = n.ten.tens + ' ' + text;
        }

        if (n.hundred.value) {
            console.log("n.hundred: ", n.hundred);
            text = n.hundred.counting + ' ' + n.hundred.mutation('céad') + ' ' + text;
            console.log("text", text);
        }
    }
    console.log("test");
    console.log(text.trim(), 'text')
    return text.trim();
}

export function irishForNumber(n: number): string {
    let triplets = tripletize(n);
    let i = 0;
    let text = '';
    let lastTriplet = new Triplet(0);
    for (let triplet of triplets) {
        let combiner = ', ';
        if (!lastTriplet.value) {
            combiner = '';
        } else if ((lastTriplet.value ?? 0) < 20) {
            console.log("space being used")
            combiner = ' ';
        }
        text = irishForTriplet(triplet, POWERS_OF_THOUSAND[i]) + combiner + text;
        lastTriplet = triplet;
        i += 1;
    }
    return text;
}
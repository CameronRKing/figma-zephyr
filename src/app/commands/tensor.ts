import { centerInViewport, curr, DPI, move, numerifyFraction, setRotation } from "../utils";

export const cubits = [
    {
        txt: 'Sacred',
        len: 20.6,
    },
    {
        txt: 'Lost',
        len: 23.49,
    },
    {
        txt: 'Empowerment',
        len: 28.86,
    },
    {
        txt: 'Sound',
        len: 39.31,
    },
    {
        txt: 'Galactic',
        len: 24.359,
    },
    {
        txt: 'Vortex',
        len: 77.56,
    },
    {
        txt: 'Balance',
        len: 41.708,
    },
    {
        txt: 'Feminine',
        len: 26.614,
    },
    {
        txt: 'Masculine',
        len: 24.931,
    },
    {
        txt: 'Rebus',
        len: 28.316,
    },
];

const makeRing = (cubit, fraction) => {
    const diam = (cubit.len * DPI * numerifyFraction(fraction)) / Math.PI;
    const ring = figma.createEllipse();
    ring.resize(diam, diam);
    ring.fills = [];
    ring.strokes = [
        {
            type: 'SOLID',
            color: {r: 0, g: 0, b: 0},
        },
    ];
    ring.strokeWeight = 1;
    ring.x = 0;
    ring.y = 0;
    ring.name = `Ring - ${cubit.txt} - ${fraction}`;
    return ring;
};

export default {
    il: {
        bind: 'il',
        name: 'Interactive lace',
        args: [{name: 'irrelevant', type: 'ringLace'}],
        exec: () => {}, // all cmds are run from within the input, which receives runCmd as a prop
    },
    im: {
        bind: 'im',
        name: 'Interactive move selection',
        args: [{name: 'irrelevant', type: 'position', label: 'Position'}],
        exec: () => {},
    },
    ill: {
        bind: 'ill',
        name: 'Interactive lace line',
        args: [{name: 'irrelevant', type: 'laceLine'}],
        exec: () => {},
    },
    cll: {
        bind: 'cll',
        name: 'Create lace line',
        args: [
            {name: 'numRings', type: 'text', label: 'Number of rings'},
            {name: 'cubit', type: 'select', label: 'Cubit', options: () => cubits},
            {name: 'fraction', type: 'text', label: 'Fraction'},
        ],
        exec: ({numRings, cubit, fraction}) => {
            const frac = numerifyFraction(fraction);
            const diam = (cubit.len * DPI * frac) / Math.PI;
            const ring = makeRing(cubit, fraction);
            const rings = [ring];
            for (let ii = 1; ii < numRings; ii++) {
                const newRing = rings.slice(-1)[0].clone();
                newRing.x += diam / 2;
                rings.push(newRing);
            }
            const group = figma.group(rings, figma.currentPage);
            group.name = `${numRings}-lace line - ${cubit.txt} - ${fraction}`;

            centerInViewport(group);
            figma.currentPage.selection = [group];

            return group;
        },
    },
    msc: {
        name: 'Move selection (by) cubit',
        args: [
            {name: 'cubit', type: 'select', opts: () => cubits},
            {name: 'fraction', type: 'text'},
            {name: 'angle', type: 'text'},
        ],
        exec: ({cubit, fraction, angle}) => {
            const dist = cubit.len * DPI * numerifyFraction(fraction);
            curr().forEach((node) => move(node, dist, angle));
        },
    },
    ca: {
        bind: 'ca',
        name: 'Create Amplifier',
        args: [
            {name: 'cubit', type: 'select', label: 'Cubit', options: () => cubits},
            {name: 'fraction', type: 'text', label: 'Fraction'},
        ],
        exec: ({cubit, fraction}) => {
            const frac = numerifyFraction(fraction);
            const baseLen = cubit.len * DPI * frac; // inches to pixels
            const longArm = baseLen / 1.618;
            const shortArm = longArm / 1.618;

            const vec = figma.createVector();
            vec.name = `Amp - ${cubit.txt} - ${fraction}`;

            const short = `L ${shortArm} 0`;
            const long = `L ${shortArm * 2} ${longArm + shortArm}`;
            const curve = `C ${shortArm * 0.99} ${shortArm * 0.55} ${shortArm * 1.55} ${shortArm * 0.99} ${
                shortArm * 2
            } ${shortArm}`;

            vec.vectorPaths = [
                {
                    windingRule: 'NONE',
                    data: `M 0 0 ${short} ${curve} ${long}`,
                },
            ];

            centerInViewport(vec);

            figma.currentPage.selection = [vec];

            return vec;
        },
    },
    cc: {
        bind: 'cc',
        name: 'Create charger',
        args: [
            {name: 'cubit', type: 'select', label: 'Cubit', options: () => cubits},
            {name: 'fraction', type: 'text', label: 'Fraction'},
        ],
        exec: ({cubit, fraction}) => {
            const frac = numerifyFraction(fraction);
            const baseLen = cubit.len * DPI * frac;
            const offset = baseLen / 2 / Math.SQRT2;
            const vec = figma.createVector();
            vec.name = `Charger - ${cubit.txt} - ${fraction}`;

            vec.vectorPaths = [
                {
                    windingRule: 'NONE',
                    data: `M ${offset} 0 L 0 ${offset} L 0 ${offset + baseLen} L ${offset} ${offset * 2 + baseLen}`,
                },
            ];

            centerInViewport(vec);

            figma.currentPage.selection = [vec];

            return vec;
        },
    },
    cl: {
        bind: 'cl',
        name: 'Create ring lace',
        args: [
            {name: 'numRings', type: 'text', label: 'Number of rings'},
            {name: 'cubit', type: 'select', label: 'Cubit', options: () => cubits},
            {name: 'fraction', type: 'text', label: 'Fraction'},
        ],
        exec: ({numRings, cubit, fraction}) => {
            numRings = Number(numRings);
            const frac = numerifyFraction(fraction);
            const diam = (cubit.len * DPI * frac) / Math.PI;
            const ring = makeRing(cubit, fraction);

            let rings = [ring];
            let lastRing = ring;
            const baseA = 360 / numRings;
            // so the "point" of the lace in an odd set is at the top
            let angle = baseA / 2;
            for (let ii = 0; ii < numRings - 1; ii++) {
                angle += baseA;
                const newRing = lastRing.clone();
                move(newRing, diam / 2, angle);
                rings.push(newRing);
                lastRing = newRing;
            }

            const group = figma.group(rings, figma.currentPage);
            group.name = `${numRings}-ring lace - ${cubit.txt} - ${fraction}`;
            centerInViewport(group);

            figma.currentPage.selection = [group];

            return group;
        },
    },
    cs: {
        bind: 'cs',
        name: 'Create seed of life',
        args: [
            {name: 'cubit', type: 'select', label: 'Cubit', options: () => cubits},
            {name: 'fraction', type: 'text', label: 'Fraction'},
        ],
        exec: ({cubit, fraction}) => {
            const frac = numerifyFraction(fraction);
            const diam = (cubit.len * DPI * frac) / Math.PI;
            const ring = makeRing(cubit, fraction);
            ring.name = 'center';

            const top = ring.clone();
            top.y -= diam / 2 - 0.5;
            const bot = ring.clone();
            bot.y += diam / 2 - 0.5;
            const vert = figma.group([top, bot], figma.currentPage);
            vert.name = 'vert';

            const up = vert.clone();
            setRotation(up, 60);
            up.name = 'up';
            const down = vert.clone();
            setRotation(down, 120);
            down.name = 'down';

            const seed = figma.group([ring, vert, up, down], figma.currentPage);
            seed.name = `Seed of Life - ${cubit.txt} - ${fraction}`;
            centerInViewport(seed);

            figma.currentPage.selection = [seed];

            return seed;
        },
    },
}
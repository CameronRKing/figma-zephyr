import autolayoutCmds from './commands/autolayout';
import internalCmds from './commands/_internal';

interface Cmd<Args> {
    bind: string;
    name: string;
    args?: Array<InputSeq<Args>>;
    exec: ExecFn<Args>;
    hide?: boolean;
}

interface ExecFn<Args> {
    (args: Args): any | void;
}

interface InputSeq<Args> {
    name: keyof Args;
    type: InputType;
    prefill?: string | PrefillFn;
    options?: Array<string> | OptionsFn;
    label?: string;
}

type InputType = 'text' | 'select';

interface PrefillFn {
    (runCmd: RunCmdFn): string | Promise<string>;
}

interface OptionsFn {
    (runCmd: RunCmdFn): Array<string> | Promise<Array<string>>;
}

type RunCmdFn = {
    (arg: {bind: string; payload?: any}): Promise<any>;
};

/*
    jf <name>: jump to frame
    je <name>: jump to element

    ss <mnemonic>: save selection
    rs <mnemonic>: re-select selection

    brr <num>: border-radius
    w <num>: set width
        wh: set width hug
        wf: set width fixed
    h <num>: set height
        hh: set height hug
        wf: set width fixed
    r <num>: set rotation
    fs <num>: font-size
    fw <select>: font-weight
    lh <num>: line-height
    ls <num>: letter-spacing
    ps <num>: paragraph-spacing

    auto-width, auto-height, fixed-size, truncate-text
    align-top, align-middle, align-bottom

    f <color>: set fill
    fo <num>: set fill opacity

    sc <color>: set stroke color
    so <num>: set stroke opacity
    sp <center, inside, outside>: set stroke position
    sw <num>: set stroke width
    sj <miter, bevel, round>: set stroke join
*/

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
const DPI = 114; // weird number, I know, but that's what experimentation shows

// https://gist.github.com/JeremyJaydan/f7ba5f40574841b97d745f8f4ef88c07
function setRotation(node, angle) {
    let {x, y, width, height, rotation} = node;

    const theta = angle * (Math.PI / 180);
    const originTheta = rotation * (Math.PI / 180);
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    const originX =
        -Math.cos(originTheta) * x +
        y * -Math.sin(originTheta) -
        centerY * -Math.sin(originTheta) -
        centerX * -Math.cos(originTheta) +
        centerX -
        width;
    const originY =
        Math.sin(originTheta) * x +
        centerX * -Math.sin(originTheta) +
        y * -Math.cos(originTheta) -
        centerY * -Math.cos(originTheta) +
        centerY -
        height;

    const originCenterX = originX + width / 2;
    const originCenterY = originY + height / 2;

    const newX =
        Math.cos(theta) * originX +
        originY * Math.sin(theta) -
        originCenterY * Math.sin(theta) -
        originCenterX * Math.cos(theta) +
        originCenterX;
    const newY =
        -Math.sin(theta) * originX +
        originCenterX * Math.sin(theta) +
        originY * Math.cos(theta) -
        originCenterY * Math.cos(theta) +
        originCenterY;

    const transform = [
        [Math.cos(theta), Math.sin(theta), newX],
        [-Math.sin(theta), Math.cos(theta), newY],
    ];

    node.relativeTransform = transform;
}

const move = (node, dist, angle) => {
    angle = angle % 360; // just in case
    const rad = (Math.PI * angle) / 180;
    node.x += dist * Math.cos(rad);
    node.y += dist * Math.sin(rad);
    return node;
};

const numerifyFraction = (str) => {
    const [numer, denom] = str.split('/');
    return Number(numer) / Number(denom);
};

const centerInViewport = (node) => {
    const {x, y} = figma.viewport.center;
    node.x = x - node.width / 2;
    node.y = y - node.height / 2;
};

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

// https://www.figma.com/plugin-docs/editing-properties/
function clone(val) {
    return JSON.parse(JSON.stringify(val));
}

function setFillScaleMode(node: RectangleNode, mode: ImagePaint['scaleMode']) {
    const fills = clone(node.fills);
    fills[0].scaleMode = mode;
    node.fills = fills;
}

const curr = () => figma.currentPage.selection;

const BASE_GRID_SIZE = 250; // todo: link usage of this constant to a variable in the workspace instead
const CMDS = {
    ...autolayoutCmds,
    gv: {
        bind: 'gv',
        name: '(Make) Grid Variation',
        args: [],
        exec: async () => {
            const node = curr()[0];
            if (node.type !== 'INSTANCE') return;
            const dupe = node.clone();
            node.parent.appendChild(dupe);
            // assumes there are only two properties
            // will have to adjust for swapping support components in larger grids
            // )but that can wait till we're actually doing it)
            const oldVals = Object.entries(node.componentProperties).filter(
                ([propName]) => propName.startsWith('inner') || propName.startsWith('outer')
            );
            dupe.setProperties({
                [oldVals[0][0]]: oldVals[1][1].value,
                [oldVals[1][0]]: oldVals[0][1].value,
            });
        },
    },
    pgc: {
        bind: 'pgc',
        name: '(Make/Update) Project Grid Component',
        args: [],
        exec: async () => {
            const curr = figma.currentPage.selection[0];
            if (!curr || curr.type !== 'INSTANCE') return;

            let gridName = '';
            if (curr.name.startsWith('prj/')) {
                // we're creating a component for the top-level project grid
                gridName = curr.name;
            } else {
                let recur = curr.parent;
                while (!recur.name.startsWith('prj/')) {
                    if (!recur.parent) throw new Error('Did not find a parent frame that starts with `prj/`');
                    recur = recur.parent;
                }
                gridName = `${recur.name}/${curr.name}`;
            }

            const gridFrame = figma.currentPage.findOne(
                (node) => node.name === 'grids' && node.type === 'FRAME'
            ) as FrameNode;
            let gridCmp = gridFrame.findOne((node) => node.name === gridName) as ComponentNode;

            if (!gridCmp) {
                gridCmp = figma.createComponent();
                gridCmp.name = gridName;
                gridCmp.resize(BASE_GRID_SIZE, BASE_GRID_SIZE);
                gridFrame.appendChild(gridCmp);
            }

            // these are the default arguments, made explicit for documentation
            const bytes = await curr.exportAsync({
                format: 'PNG',
                constraint: {type: 'SCALE', value: 1},
            });
            const img = figma.createImage(bytes);

            gridCmp.fills = [
                {
                    imageHash: img.hash,
                    scaleMode: 'FILL',
                    scalingFactor: 1,
                    type: 'IMAGE',
                },
            ];
        },
    },
    gc: {
        bind: 'gc',
        name: '(Make Global) Grid Component',
        args: [],
        exec: async () => {
            const curr = figma.currentPage.selection[0];
            if (!curr || curr.type !== 'INSTANCE') return;
            const propNames = Object.entries(curr.componentProperties)
                .filter(([propName]) => propName.toLowerCase() !== 'type')
                .sort((l, r) => (l[0] < r[0] ? -1 : 1)) // sort by prop name, alphabetic ascending (in practice: center, inner, outer)
                .map(([_, {value}]) => value)
                .map((id) => figma.currentPage.findOne((node) => node.id == id).name) // this does hiccup & could be optimized, but it's fine as-is for now
                .map((name) => name.split('/')[1]) // remove 'stone/' prefix
                .join('-');

            const node = figma.createFrame();
            node.name = `grid/${curr.name}/${propNames}`;
            node.resize(BASE_GRID_SIZE, BASE_GRID_SIZE);
            // these are the default arguments, made explicit for documentation
            const bytes = await curr.exportAsync({
                format: 'PNG',
                constraint: {type: 'SCALE', value: 1},
            });
            const img = figma.createImage(bytes);

            node.fills = [
                {
                    imageHash: img.hash,
                    scaleMode: 'FILL',
                    scalingFactor: 1,
                    type: 'IMAGE',
                },
            ];

            const cmp = figma.createComponentFromNode(node);

            const gridFrame = figma.currentPage.findOne(
                (node) => node.name === 'grids' && node.type === 'FRAME'
            ) as FrameNode;
            gridFrame.appendChild(cmp);
        },
    },
    ses: {
        bind: 'ses',
        name: 'Start Expanding Stone (Picture)',
        args: [],
        exec: () => {
            const curr = figma.currentPage.selection[0];
            if (curr.type !== 'COMPONENT') return;
            const newCmp = curr.clone();
            curr.parent.insertChild(curr.parent.children.indexOf(curr) + 1, newCmp);
            newCmp.name = newCmp.name.replace(/\/\w+$/, '/closeup');
            const img = newCmp.children[0];
            if (img.type !== 'RECTANGLE') return;
            setFillScaleMode(img, 'CROP');
            figma.currentPage.selection = [img];
            figma.viewport.scrollAndZoomIntoView(figma.currentPage.selection);
        },
    },
    es: {
        bind: 'es',
        name: 'Expand Stone (Picture)',
        args: [],
        exec: () => {
            const curr = figma.currentPage.selection[0];
            if (curr.type !== 'RECTANGLE') return;
            curr.x = 0;
            curr.y = 0;
            curr.constrainProportions = false;
            curr.resize(BASE_GRID_SIZE, BASE_GRID_SIZE);
        },
    },
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
    gp: {
        bind: 'gp',
        name: 'Get position of selection',
        args: [],
        exec: () => {
            if (figma.currentPage.selection.length !== 1) return {x: null, y: null};
            const {x, y} = figma.currentPage.selection[0];
            return {x, y};
        },
    },
    sp: {
        bind: 'sp',
        name: 'Set position of selection',
        args: [
            {name: 'x', type: 'text', label: 'x'},
            {name: 'y', type: 'text', label: 'y'},
        ],
        exec: ({x, y}) => {
            if (!x || !y) return;
            figma.currentPage.selection.forEach((node) => {
                node.x = x;
                node.y = y;
            });
            return figma.currentPage.selection;
        },
    },
    ms: {
        bind: 'ms',
        name: 'Move selection',
        args: [
            {name: 'cubit', type: 'select', opts: () => cubits},
            {name: 'fraction', type: 'text'},
            {name: 'angle', type: 'text'},
        ],
        exec: ({cubit, fraction, angle}) => {
            const dist = cubit.len * DPI * numerifyFraction(fraction);
            figma.currentPage.selection.forEach((node) => move(node, dist, angle));
        },
    },
    rs: {
        bind: 'rs',
        name: 'Rename selection',
        args: [{name: 'newName', type: 'text', label: 'name', prefill: (runCmd) => runCmd({bind: 'gns'})}],
        exec: ({newName}) => {
            figma.currentPage.selection.forEach((node) => (node.name = newName));
            return figma.currentPage.selection;
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
    ap: {
        bind: 'ap',
        name: 'Add page',
        args: [{name: 'name', type: 'text', label: 'New page name'}],
        exec: ({name}) => {
            figma.createPage().name = name;
        },
    } as Cmd<{name: string}>,
    jp: {
        bind: 'jp',
        name: 'Jump to page',
        args: [
            {
                name: 'name',
                type: 'select',
                label: 'Jump to',
                options: (runCmd) => runCmd({bind: 'lp'}),
            },
        ],
        exec: ({name}) => {
            figma.currentPage = figma.root.children.find((node) => node.name === name);
        },
    } as Cmd<{name: string}>,
    np: {
        bind: 'np',
        name: 'Rename current page',
        args: [{name: 'newName', type: 'text', label: 'Rename page to', prefill: (runCmd) => runCmd({bind: 'lpc'})}],
        exec: ({newName}) => {
            figma.currentPage.name = newName;
        },
    } as Cmd<{newName: string}>,
    dp: {
        bind: 'dp',
        name: 'Delete current page',
        exec: () => {
            const pages = figma.root.children;
            const numPages = pages.length;
            if (numPages === 1) return;

            const oldPage = figma.currentPage;
            const idx = pages.indexOf(oldPage);
            const newIdx = (idx + 1) % numPages;
            figma.currentPage = pages[newIdx];
            oldPage.remove();
        },
    },
    ds: {
        bind: 'ds',
        name: 'Delete selection',
        args: [],
        exec: () => {
            figma.currentPage.selection.forEach((node) => node.remove());
        },
    },
    fh: {
        bind: 'fh',
        name: 'Copy focus handler',
        args: [
            {
                type: 'text',
                name: 'irrelevant',
                label: 'Handler code',
                prefill: () =>
                    `document.addEventListener('keydown', evt => { if (evt.ctrlKey && evt.metaKey) document.querySelector('iframe').contentDocument.querySelector('iframe').contentWindow.postMessage('focus', '*') })`,
            },
        ],
        exec: () => {},
    },
    xz: {
        bind: 'xz',
        name: 'Exit Zephyr',
        exec: () => figma.closePlugin(),
        hide: true,
    },
    ...internalCmds,
};

// @ts-ignore
Object.entries(CMDS).forEach(([bind, cmd]) => (cmd.bind = bind));
const arrayedCommands = Object.values(CMDS) as Array<Cmd<any>>;
export default arrayedCommands;
export {RunCmdFn, Cmd};

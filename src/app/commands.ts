import internalCmds from './commands/_internal';
import autolayoutCmds from './commands/autolayout';
import layerCmds from './commands/layers';
import pageCmds from './commands/pages';
import stoneCmds from './commands/stones';
import tensorCmds from './commands/tensor';


// 
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

const CMDS = {
    ...autolayoutCmds,
    ...layerCmds,
    ...pageCmds,
    ...tensorCmds,
    ...stoneCmds,
    gp: {
        bind: 'gp',
        name: 'Get position of selection',
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
    // not sure where/if these should live yet
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

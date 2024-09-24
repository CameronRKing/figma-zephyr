import internalCmds from './commands/_internal';
import autolayoutCmds from './commands/autolayout';
import layerCmds from './commands/layers';
import pageCmds from './commands/pages';
import positionCmds from './commands/position';
// import stoneCmds from './commands/stones';
// import tensorCmds from './commands/tensor';

/*

    Tentative Roadmapping
    (or at least Desired Features)

    - improving internal typing
    - improving transformations of command structures for consumers
    - adding bind-only progressive disclosure alongside fuzzy flat search
    - adding IDs to all commands
        - customization/internationalization for bindings & labels
            - including "universal" bindings like "accept" and "next/prev"
    - writing all the design commands I want
        - considering how to handle components & variables
    - compressed style/prototyping display
    - adding second pane for layers/pages + more traditional keyboard commands
    - style macros
        - tag touched nodes, auto-update on macro change
        - ideally, "convert this node's style into a macro" command
    - action macros
    - node templates
    - sharing customizations/macros/templates
    - way better design for discoverability, understandability, & feel
        - possibly animations


    - then the writeup
        - principles/values
        - exposing all the alternatives left unseen + reasoning behind my choices
        - my experiences
        - my informal research
        - eye forward to other friction points unsolvable by Zephyr
        - emphasis on "to make design more frictionless we need a whole new environment... and this is what I would do"
*/

interface Cmd<Args> {
    id: Symbol;
    bind: string;
    name: string;
    args?: Array<InputSeq<Args>>;
    exec?: ExecFn<Args>;
    children?: Array<Cmd<Args>>;
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
    (arg: { bind: string; payload?: any }): Promise<any>;
};

const CMDS = {
    ...autolayoutCmds,
    ...layerCmds,
    ...pageCmds,
    ...positionCmds,
    // ...tensorCmds,
    // ...stoneCmds,
    // not sure where/if these should live yet
    fh: {
        id: Symbol('focus_handler.copy'),
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
        id: Symbol('zephyr.exit'),
        name: 'Exit Zephyr',
        exec: () => figma.closePlugin(),
        // hide: true,
    },
    ...internalCmds,
};

// @ts-ignore
Object.entries(CMDS).forEach(([bind, cmd]) => (cmd.bind = bind));
// @ts-ignore
Object.entries(CMDS).forEach(([bind, parent]) => {
    // @ts-ignore
    if (parent.children) {
        // @ts-ignore
        Object.entries(parent.children).forEach(([bind, cmd]) => {
            // @ts-ignore
            cmd.bind = parent.bind + bind;
        });
    }
});
const arrayedCommands = Object.values(CMDS) as Array<Cmd<any>>;
export default arrayedCommands;
export { RunCmdFn, Cmd };

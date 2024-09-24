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
        + Cmds/CmdFamilies are an improvement
        - RunCmd accessing commands by id rather than bind would be more semantic
        - separating arg params into own object with typings with autocomplete would improve config experience
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
    id: string; // considered using Symbols but not sure of the value at this point
    label: string;
    bind?: string; // added in post-processing, not directly in definition
    args?: Array<InputSeq<Args>>;
    exec: ExecFn<Args>;
    hide?: boolean;
}

interface CmdFamily {
    label: string;
    children: CmdGroup;
}

interface CmdGroup {
    [bind: string]: Cmd<any> | CmdFamily;
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
    prop?: string;
}

type InputType = 'text' | 'select' | 'livenumber';

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
        id: 'focus_handler.copy',
        label: 'Copy focus handler',
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
        id: 'zephyr.exit',
        label: 'Exit Zephyr',
        exec: () => figma.closePlugin(),
        // hide: true,
    },
    ...internalCmds,
} as CmdGroup;

function isCmd(obj: Cmd<any> | CmdFamily): obj is Cmd<any> {
    return (obj as Cmd<any>).exec !== undefined;
}

const concatNames = (prelabel, name) => (prelabel.length ? prelabel + ' - ' + name : name);

function flattenCmds(cmds: CmdGroup, allCmds = [], prebind = '', prelabel = '') {
    Object.entries(cmds).forEach(([bind, cmd]) => {
        if (isCmd(cmd)) {
            cmd.label = concatNames(prelabel, cmd.label);
            cmd.bind = prebind + bind;
            allCmds.push(cmd);
        } else flattenCmds(cmd.children, allCmds, prebind + bind, concatNames(prelabel, cmd.label));
    });
    return allCmds;
}
const flattened = flattenCmds(CMDS);
export default flattened;
export { RunCmdFn, Cmd, CmdFamily, CmdGroup, CMDS as NestedCmds };

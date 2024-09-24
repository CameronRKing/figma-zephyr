import { CmdGroup } from '../commands';

type Layoutable = ComponentNode | ComponentSetNode | FrameNode | InferredAutoLayoutResult | InstanceNode;
const LayoutableNodes = ['COMPONENT', 'COMPONENT_SET', 'FRAME', 'INSTANCE'];
type AxisAlign = 'MIN' | 'CENTER' | 'MAX';
type UpdateFn = {
    (node: Layoutable): void;
};

const updateSelection = (fn: UpdateFn) =>
    figma.currentPage.selection
        .filter((node) => LayoutableNodes.includes(node.type))
        .map((node) => node as Layoutable)
        .forEach(fn);

const alignments = {
    // all alignments are given for horizontal flow
    // for the corresponding vertical flow, switch primary & counter
    topLeft: {
        primary: 'MIN',
        counter: 'MIN',
    },
    topCenter: {
        primary: 'CENTER',
        counter: 'MIN',
    },
    topRight: {
        primary: 'MAX',
        counter: 'MIN',
    },
    left: {
        primary: 'MIN',
        counter: 'CENTER',
    },
    center: {
        primary: 'CENTER',
        counter: 'CENTER',
    },
    right: {
        primary: 'MAX',
        counter: 'CENTER',
    },
    botLeft: {
        primary: 'MIN',
        counter: 'MAX',
    },
    botCenter: {
        primary: 'CENTER',
        counter: 'MAX',
    },
    botRight: {
        primary: 'MAX',
        counter: 'MAX',
    },
};

function setAlignment(align: keyof typeof alignments) {
    return (node: Layoutable) => {
        if (node.layoutMode === 'NONE') return;

        let { primary, counter } = alignments[align] as { primary: AxisAlign; counter: AxisAlign };
        if (node.layoutMode === 'VERTICAL') {
            const tmp = primary;
            primary = counter;
            counter = tmp;
        }
        node.primaryAxisAlignItems = primary;
        node.counterAxisAlignItems = counter;
    };
}

export default {
    a: {
        label: 'Autolayout',
        children: {
            h: {
                id: 'autolayout.horizontal',
                label: 'Horizontal Flow',
                async exec() {
                    updateSelection((node) => (node.layoutMode = 'HORIZONTAL'));
                },
            },
            v: {
                id: 'autolayout.vertical',
                label: 'Vertical Flow',
                async exec() {
                    updateSelection((node) => (node.layoutMode = 'VERTICAL'));
                },
            },
            r: {
                id: 'autolayout.remove',
                label: 'Remove',
                async exec() {
                    updateSelection((node) => (node.layoutMode = 'NONE'));
                },
            },
            is: {
                id: 'autolayout.item_spacing',
                label: '(Set) Item Spacing',
                args: [{ name: 'itemSpacing', type: 'livenumber', label: 'Item Spacing', prop: 'itemSpacing' }],
                async exec({ itemSpacing }) {
                    updateSelection((node) => (node.itemSpacing = itemSpacing));
                },
            },
            hp: {
                id: 'autolayout.horizontal_padding',
                label: '(Set) Horizontal Padding',
                args: [
                    {
                        name: 'horizontalPadding',
                        type: 'livenumber',
                        label: 'Horizontal Padding',
                        prop: 'horizontalPadding',
                    },
                ],
                async exec({ horizontalPadding }) {
                    updateSelection((node) => (node.horizontalPadding = horizontalPadding));
                },
            },
            vp: {
                id: 'autolayout.vertical_padding',
                label: '(Set) Vertical Padding',
                args: [
                    { name: 'verticalPadding', type: 'livenumber', label: 'Vertical Padding', prop: 'verticalPadding' },
                ],
                async exec({ verticalPadding }) {
                    updateSelection((node) => (node.verticalPadding = verticalPadding));
                },
            },
            // debating whether to nest these
            // for now, choosing to leave alone
            tl: {
                id: 'autolayout.align.top_left',
                label: '(Align) Top Left',
                async exec() {
                    updateSelection(setAlignment('topLeft'));
                },
            },
            tc: {
                id: 'autolayout.align.top_center',
                label: '(Align) Top Center',
                async exec() {
                    updateSelection(setAlignment('topCenter'));
                },
            },
            tr: {
                id: 'autolayout.align.top_right',
                label: '(Align) Top Right',
                async exec() {
                    updateSelection(setAlignment('topRight'));
                },
            },
            cl: {
                id: 'autolayout.align.center_left',
                label: '(Align) Center Left',
                async exec() {
                    updateSelection(setAlignment('left'));
                },
            },
            cc: {
                id: 'autolayout.align.center_center',
                label: '(Align) Center Center',
                async exec() {
                    updateSelection(setAlignment('center'));
                },
            },
            cr: {
                id: 'autolayout.align.center_right',
                label: '(Align) Center Right',
                async exec() {
                    updateSelection(setAlignment('right'));
                },
            },
            bl: {
                id: 'autolayout.align.bottom_left',
                label: '(Align) Bottom Left',
                async exec() {
                    updateSelection(setAlignment('botLeft'));
                },
            },
            bc: {
                id: 'autolayout.align.bottom_center',
                label: '(Align) Bottom Center',
                async exec() {
                    updateSelection(setAlignment('botCenter'));
                },
            },
            br: {
                id: 'autolayout.align.bottom_right',
                label: '(Align) Bottom Right',
                async exec() {
                    updateSelection(setAlignment('botRight'));
                },
            },
        },
    },
} as CmdGroup;

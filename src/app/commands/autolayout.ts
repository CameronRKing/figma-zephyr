type Layoutable = ComponentNode | ComponentSetNode | FrameNode | InferredAutoLayoutResult | InstanceNode;
const LayoutableNodes = ['COMPONENT', 'COMPONENT_SET', 'FRAME', 'INSTANCE'];
type AxisAlign = 'MIN' | 'CENTER' | 'MAX';
type UpdateFn = {
    (node: Layoutable): void;
};

const updateSelection = (fn: UpdateFn) =>
    figma.currentPage.selection
        .filter((node) => LayoutableNodes.includes(node.type))
        // @ts-ignore
        .forEach(fn);

const alignments = {
    // all alignments are given for horizontal
    // for the corresponding vertical alignment, we just switch primary & counter
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

        let {primary, counter} = alignments[align] as {primary: AxisAlign; counter: AxisAlign};
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
    ah: {
        name: 'Autolayout: Horizontal',
        args: [],
        async exec() {
            updateSelection((node) => (node.layoutMode = 'HORIZONTAL'));
        },
    },
    av: {
        name: 'Autolayout: Vertical',
        args: [],
        async exec() {
            updateSelection((node) => (node.layoutMode = 'VERTICAL'));
        },
    },
    ar: {
        name: 'Autolayout: Remove',
        args: [],
        async exec() {
            updateSelection((node) => (node.layoutMode = 'NONE'));
        },
    },
    atl: {
        name: 'Autolayout: (Align) Top Left',
        args: [],
        async exec() {
            updateSelection(setAlignment('topLeft'));
        },
    },
    atc: {
        name: 'Autolayout: (Align) Top Center',
        args: [],
        async exec() {
            updateSelection(setAlignment('topCenter'));
        },
    },
    atr: {
        name: 'Autolayout: (Align) Top Right',
        args: [],
        async exec() {
            updateSelection(setAlignment('topRight'));
        },
    },
    acl: {
        name: 'Autolayout: (Align) Center Left',
        args: [],
        async exec() {
            updateSelection(setAlignment('left'));
        },
    },
    acc: {
        name: 'Autolayout: (Align) Center Center',
        args: [],
        async exec() {
            updateSelection(setAlignment('center'));
        },
    },
    acr: {
        name: 'Autolayout: (Align) Center Right',
        args: [],
        async exec() {
            updateSelection(setAlignment('right'));
        },
    },
    abl: {
        name: 'Autolayout: (Align) Bottom Left',
        args: [],
        async exec() {
            updateSelection(setAlignment('botLeft'));
        },
    },
    abc: {
        name: 'Autolayout: (Align) Bottom Center',
        args: [],
        async exec() {
            updateSelection(setAlignment('botCenter'));
        },
    },
    abr: {
        name: 'Autolayout: (Align) Bottom Right',
        args: [],
        async exec() {
            updateSelection(setAlignment('botRight'));
        },
    },
    ais: {
        name: 'Autolayout: (Set) Item Spacing',
        args: [{name: 'itemSpacing', type: 'livenumber', label: 'Item Spacing', prop: 'itemSpacing'}],
        async exec({itemSpacing}) {
            updateSelection((node) => (node.itemSpacing = itemSpacing));
        },
    },
    ahp: {
        name: 'Autolayout: (Set) Horizontal Padding',
        args: [{name: 'horizontalPadding', type: 'livenumber', label: 'Horizontal Padding', prop: 'horizontalPadding'}],
        async exec({horizontalPadding}) {
            updateSelection((node) => (node.horizontalPadding = horizontalPadding));
        },
    },
    avp: {
        name: 'Autolayout: (Set) Vertical Padding',
        args: [{name: 'verticalPadding', type: 'livenumber', label: 'Vertical Padding', prop: 'verticalPadding'}],
        async exec({verticalPadding}) {
            updateSelection((node) => (node.verticalPadding = verticalPadding));
        },
    },
};

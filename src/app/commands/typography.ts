import { clone, curr, preloadSelectedFonts } from '../utils';
import { CmdGroup } from '../commands';

const currText = () =>
    curr()
        .filter((node) => node.type === 'TEXT')
        .map((node) => node as TextNode);

export default {
    // these commands need *guarding*
    // they apply only to text nodes
    // should be available only when all selected nodes are text nodes
    t: {
        label: 'Typography',
        children: {
            s: {
                id: 'typography.size',
                label: '(Set) Size',
                args: [{ name: 'size', type: 'livenumber', label: 'Font Size', prop: 'fontSize' }],
                async exec({ size }) {
                    await preloadSelectedFonts();
                    currText().forEach((node) => (node.fontSize = size));
                },
            },
            ls: {
                id: 'typography.letter_spacing',
                label: '(Set) Letter Spacing',
                args: [
                    {
                        name: 'letterSpacing',
                        type: 'livenumber',
                        label: 'Letter Spacing',
                        prop: 'letterSpacing',
                        propKey: 'value',
                    },
                ],
                async exec({ letterSpacing }) {
                    await preloadSelectedFonts();
                    currText().forEach(
                        (node) => (node.letterSpacing = clone(node.letterSpacing, { value: letterSpacing }))
                    );
                },
            },
            lh: {
                id: 'typography.line_height',
                label: '(Set) Line Height',
                args: [
                    {
                        name: 'lineHeight',
                        type: 'livenumber',
                        label: 'Line Height',
                        prop: 'lineHeight',
                        propKey: 'value',
                    },
                ],
                async exec({ lineHeight }) {
                    await preloadSelectedFonts();
                    currText().forEach((node) => {
                        node.lineHeight = {
                            unit: 'PIXELS',
                            value: lineHeight,
                        };
                    });
                },
            },
            ps: {
                id: 'typography.paragraph_spacing',
                label: '(Set) Paragraph Spacing',
                args: [
                    {
                        name: 'paragraphSpacing',
                        type: 'livenumber',
                        label: 'Paragraph Spacing',
                        prop: 'paragraphSpacing',
                    },
                ],
                async exec({ paragraphSpacing }) {
                    await preloadSelectedFonts();
                    currText().forEach((node) => (node.paragraphSpacing = paragraphSpacing));
                },
            },
            a: {
                label: 'Align',
                children: {
                    l: {
                        id: 'typography.align_left',
                        label: 'Left',
                        async exec() {
                            await preloadSelectedFonts();
                            currText().forEach((node) => (node.textAlignHorizontal = 'LEFT'));
                        },
                    },
                    c: {
                        id: 'typography.align_center',
                        label: 'Center',
                        async exec() {
                            await preloadSelectedFonts();
                            currText().forEach((node) => (node.textAlignHorizontal = 'CENTER'));
                        },
                    },
                    r: {
                        id: 'typography.align_right',
                        label: 'Right',
                        async exec() {
                            await preloadSelectedFonts();
                            currText().forEach((node) => (node.textAlignHorizontal = 'RIGHT'));
                        },
                    },
                    j: {
                        id: 'typography.align_justified',
                        label: 'Justified',
                        async exec() {
                            await preloadSelectedFonts();
                            currText().forEach((node) => (node.textAlignHorizontal = 'JUSTIFIED'));
                        },
                    },
                    t: {
                        id: 'typography.align_top',
                        label: 'Top',
                        async exec() {
                            await preloadSelectedFonts();
                            currText().forEach((node) => (node.textAlignVertical = 'TOP'));
                        },
                    },
                    m: {
                        id: 'typography.align_middle',
                        label: 'Middle (Vertical)',
                        async exec() {
                            await preloadSelectedFonts();
                            currText().forEach((node) => (node.textAlignVertical = 'CENTER'));
                        },
                    },
                    b: {
                        id: 'typography.align_bottom',
                        label: 'Align Bottom',
                        async exec() {
                            await preloadSelectedFonts();
                            currText().forEach((node) => (node.textAlignVertical = 'BOTTOM'));
                        },
                    },
                },
            },
            aw: {
                id: 'typography.auto_width',
                label: 'Auto Width',
                async exec() {
                    await preloadSelectedFonts();
                    currText().forEach((node) => (node.textAutoResize = 'WIDTH_AND_HEIGHT'));
                },
            },
            ah: {
                id: 'typography.auto_height',
                label: 'Auto Height',
                async exec() {
                    await preloadSelectedFonts();
                    currText().forEach((node) => (node.textAutoResize = 'HEIGHT'));
                },
            },
            fs: {
                id: 'typography.fixed_size',
                label: 'Fixed Size',
                async exec() {
                    await preloadSelectedFonts();
                    currText().forEach((node) => (node.textAutoResize = 'NONE'));
                },
            },
            t: {
                id: 'typography.truncate',
                label: 'Truncate',
                async exec() {
                    await preloadSelectedFonts();
                    currText().forEach((node) => (node.textAutoResize = 'TRUNCATE'));
                },
            },
            c: {
                label: 'Case',
                children: {
                    o: {
                        id: 'typography.case.original',
                        label: 'Original',
                        async exec() {
                            await preloadSelectedFonts();
                            currText().forEach((node) => (node.textCase = 'ORIGINAL'));
                        },
                    },
                    u: {
                        id: 'typography.case.upper',
                        label: 'Upper',
                        async exec() {
                            await preloadSelectedFonts();
                            currText().forEach((node) => (node.textCase = 'UPPER'));
                        },
                    },
                    l: {
                        id: 'typography.case.lower',
                        label: 'Lower',
                        async exec() {
                            await preloadSelectedFonts();
                            currText().forEach((node) => (node.textCase = 'LOWER'));
                        },
                    },
                    t: {
                        id: 'typography.case.title',
                        label: 'Title',
                        async exec() {
                            await preloadSelectedFonts();
                            currText().forEach((node) => (node.textCase = 'TITLE'));
                        },
                    },
                    sc: {
                        id: 'typography.case.small_caps',
                        label: 'Small Caps',
                        async exec() {
                            await preloadSelectedFonts();
                            currText().forEach((node) => (node.textCase = 'SMALL_CAPS'));
                        },
                    },
                    scf: {
                        id: 'typography.case.small_caps_forced',
                        label: 'Small Caps - Forced',
                        async exec() {
                            await preloadSelectedFonts();
                            currText().forEach((node) => (node.textCase = 'SMALL_CAPS_FORCED'));
                        },
                    },
                },
            },
        },
    },
} as CmdGroup;

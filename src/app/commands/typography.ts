import { clone, curr } from '../utils';
import { CmdGroup } from '../commands';

const currText = () =>
    curr()
        .filter((node) => node.type === 'TEXT')
        .map((node) => node as TextNode);

export default {
    // these commands need *guarding*
    // they apply only to text nodes
    // should be available only when all selected nodes are text nodes
    // exec() ideally should know that all commands
    t: {
        label: 'Typography',
        children: {
            s: {
                id: 'typography.size',
                label: '(Set) Size',
                args: [{ name: 'size', type: 'livenumber', label: 'Font Size', prop: 'fontSize' }],
                exec({ size }) {
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
                exec({ letterSpacing }) {
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
                exec({ lineHeight }) {
                    currText().forEach((node) => {
                        node.lineHeight = {
                            unit: 'PIXELS',
                            value: lineHeight,
                        };
                    });
                },
            },
        },
    },
} as CmdGroup;

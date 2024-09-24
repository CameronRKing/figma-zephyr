import { curr } from '../utils';

export default {
    gp: {
        name: 'Get position of selection',
        exec() {
            if (curr().length !== 1) return { x: null, y: null };
            const { x, y } = curr()[0];
            return { x, y };
        },
    },
    sp: {
        name: 'Set position of selection',
        args: [
            { name: 'x', type: 'text', label: 'x' },
            { name: 'y', type: 'text', label: 'y' },
        ],
        exec({ x, y }) {
            if (!x || !y) return;
            curr().forEach((node) => {
                node.x = x;
                node.y = y;
            });
            return curr();
        },
    },
};

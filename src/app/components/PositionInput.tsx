import * as React from 'react';
import {Text} from 'react-figma-plugin-ds';
import {RunCmdFn} from '../commands';
import { cubits } from '../commands/tensor';


export default function PositionInput({
    onFinish,
    onCancel,
    runCmd,
}: {
    onFinish: (any) => void;
    onCancel: () => void;
    runCmd: RunCmdFn;
}) {
    const [cubit, setCubit] = React.useState(cubits[0]);
    const [angle, setAngle] = React.useState(0);
    const [numer, setNumer] = React.useState(0);
    const [denom, setDenom] = React.useState(4);
    const [pos, setPos] = React.useState({x: null, y: null});
    const angleRef = React.useRef(null);

    React.useEffect(() => {
        angleRef?.current?.focus();
    }, []);

    React.useEffect(() => {
        runCmd({bind: 'gp'}).then((pp) => {
            console.log({pp});
            setPos(pp);
        });
    }, []);

    React.useEffect(() => {
        if (!pos.x) return;
        const rad = (angle / 180) * Math.PI;
        const dist = (cubit.len * 72 * numer) / denom;
        const xDist = dist * Math.cos(rad);
        const yDist = dist * Math.sin(rad);

        runCmd({bind: 'sp', payload: {x: pos.x + xDist, y: pos.y + yDist}});
    }, [pos, cubit, angle, numer, denom]);

    const keybinds = React.useCallback(
        (evt: React.KeyboardEvent) => {
            const numerKey = evt.altKey;
            const denomKey = evt.metaKey;
            switch (evt.key) {
                case 'Escape':
                    runCmd({bind: 'sp', payload: pos});
                    onCancel();
                    break;
                case 'Enter':
                    onFinish(null);
                    break;
                case 'j':
                    setCubit(cubits[cubits.indexOf(cubit) + (1 % cubits.length)]);
                    break;
                case 'k':
                    if (cubits.indexOf(cubit) == 0) {
                        setCubit[cubits.length - 1];
                        break;
                    }
                    setCubit(cubits[cubits.indexOf(cubit) - 1]);
                    break;
                case 'ArrowUp':
                    if (numerKey) setNumer(numer + 1);
                    else if (denomKey) {
                        setDenom(denom * 2);
                        setNumer(numer * 2);
                    } else {
                        if (evt.shiftKey) setAngle(angle + 5);
                        else setAngle(angle + 1);
                    }
                    break;
                case 'ArrowDown':
                    if (numerKey) setNumer(numer - 1 || 0);
                    else if (denomKey) {
                        setDenom(denom / 2 < 1 ? 1 : denom / 2);
                        setNumer(Math.ceil(numer / 2));
                    } else {
                        if (evt.shiftKey) setAngle(angle - 5);
                        else setAngle(angle - 1);
                    }
                    break;
            }
        },
        [angle, cubit, numer, denom]
    );
    return (
        <div onKeyDown={keybinds}>
            <Text>
                <b className="label">Angle</b>
            </Text>
            <input ref={angleRef} type="number" value={angle} onChange={(evt) => setAngle(+evt.target.value)} />

            <Text>
                <b className="label">Cubit</b>
            </Text>
            {cubits.map(({txt, len}) => (
                <div
                    key={txt}
                    style={{
                        background: cubit.txt == txt ? 'gray' : 'white',
                        color: cubit.txt == txt ? 'white' : 'gray',
                    }}
                >
                    {txt}: {len}"
                </div>
            ))}

            <Text>
                <b className="label">Fraction</b>
            </Text>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <input
                    type="number"
                    style={{width: 'fit-content'}}
                    min={1}
                    step={1}
                    value={numer}
                    onChange={(evt) => setNumer(+evt.target.value || 1)}
                />
                /
                <input
                    type="number"
                    style={{width: 'fit-content'}}
                    min={1}
                    step={1}
                    value={denom}
                    onChange={(evt) => setDenom(+evt.target.value || 1)}
                />
            </div>
        </div>
    );
}

import * as React from 'react';
import { RunCmdFn } from '../commands';
import { Text } from 'react-figma-plugin-ds';

interface Props {
    label: string;
    prop: string;
    propKey?: string;
    onFinish: (any) => void;
    onCancel: () => void;
    runCmd: RunCmdFn;
}

export default function LiveNumber({ label, prop, propKey, onFinish, onCancel, runCmd }: Props) {
    const [initialVal, setInitialVal] = React.useState(0);
    const [currVal, setCurrVal] = React.useState(0);

    React.useEffect(() => {
        let cmd;
        if (propKey) {
            cmd = runCmd({ bind: 'getobjprop', payload: { prop, key: propKey } });
        } else {
            cmd = runCmd({ bind: 'getprop', payload: { prop } });
        }
        cmd.then((val) => {
            val = val === undefined ? 0 : val;
            setInitialVal(val);
            setCurrVal(val);
        });
    }, [prop, propKey]);

    const broadcastChange = React.useCallback((val) => {
        if (propKey) runCmd({ bind: 'setobjprop', payload: { prop, key: propKey, val } });
        else runCmd({ bind: 'setprop', payload: { prop, val } });
        setCurrVal(val);
    }, []);

    const handleKeyCmd = React.useCallback(
        (evt) => {
            switch (evt.key) {
                case 'Escape':
                    if (propKey)
                        runCmd({ bind: 'setobjprop', payload: { prop, key: propKey, val: initialVal } }).then(onCancel);
                    else runCmd({ bind: 'setprop', payload: { prop, val: initialVal } }).then(onCancel);
                    break;
                case ' ':
                case 'Enter':
                    onFinish(currVal);
                    break;
                case 'k':
                    broadcastChange(currVal + 1);
                    break;
                case 'j':
                    broadcastChange(currVal - 1);
                    break;
                default:
                // do nothing
            }
        },
        [initialVal, currVal]
    );

    return (
        <>
            {label ? (
                <Text>
                    <b className="label">{label}</b>
                </Text>
            ) : (
                <></>
            )}

            <input
                autoFocus
                type="number"
                step="1"
                value={currVal}
                onChange={(evt) => broadcastChange(+evt.target.value)}
                onKeyDown={handleKeyCmd}
            />
        </>
    );
}

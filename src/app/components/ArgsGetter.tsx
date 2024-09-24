import * as React from 'react';
import { Cmd, RunCmdFn } from '../commands';
import TextInput from './TextInput';
import SelectInput from './SelectInput';
import RingLaceInput from './RingLaceInput';
import PositionInput from './PositionInput';
import LaceLineInput from './LaceLineInput';
import LiveNumber from './LiveNumber';

function EmptyInput() {
    return <></>;
}

export default ({
    args,
    onFinish,
    onCancel,
    runCmd,
}: {
    args: Cmd<any>['args'];
    onFinish: (any) => void;
    onCancel: () => void;
    runCmd: RunCmdFn;
}) => {
    const [currArg, setCurrArg] = React.useState(0);
    const [retVal, setRetVal] = React.useState({});

    React.useEffect(() => {
        if (!args[currArg]) {
            onFinish(retVal);
            return;
        }
    }, [currArg]);

    const onInputFinish = React.useCallback(
        (argVal) => {
            setRetVal({ ...retVal, [args[currArg].name]: argVal });
            setCurrArg(currArg + 1);
        },
        [currArg, retVal]
    );

    return React.createElement(
        {
            text: TextInput,
            livenumber: LiveNumber,
            select: SelectInput,
            ringLace: RingLaceInput,
            position: PositionInput,
            laceLine: LaceLineInput,
            undefined: EmptyInput,
        }[args[currArg]?.type],
        { ...args[currArg], onFinish: onInputFinish, onCancel, runCmd }
    );
};

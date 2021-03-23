import React, {useState} from "react";
import {useForm} from 'react-hook-form';
import {doFetch} from "./ApiClient";
import {Form} from "./components/Form";
import {Line, LineChart, Tooltip, XAxis, YAxis} from 'recharts'

const App = () => {
    const {register, handleSubmit} = useForm();
    const [result, setResult] = useState<number[][]>([]);

    const onSubmit = async (data: any) => setResult(await doFetch('/corrode', {
        corner_diff_boost: 0.003,
        circle_diff_boost: 0.8,
        crack_rate: 0.05,
        crack_diff: 0.002,
        ...data
    }))

    const data = React.useMemo(() =>
            (result[0] || []).map((el: number, i: number,) => ({name: result[1][i], amt: el})),
        [result]
    );

    return <main>
        <header>
            <h2>Bridge Corrosion Simulator</h2>
        </header>
        <Form onSubmit={handleSubmit(onSubmit)} register={register}/>
        <br/>
        {result && <data>
            <LineChart width={500} height={200} data={data}
                       margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                <XAxis dataKey="name"/>
                <Line type="monotone" dataKey={"amt"} stroke="#8884d8" dot={false}/>
                <YAxis/>
                <Tooltip/>
            </LineChart>
        </data>}
    </main>;
};

export default App;

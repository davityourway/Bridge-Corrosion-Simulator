import React, {useEffect, useState} from "react";
import {useForm} from 'react-hook-form';
import {doFetch} from "./ApiClient";
import {Form} from "./components/Form";
import {Chart} from "./components/Chart";

const App = () => {
    const {register, handleSubmit} = useForm();
    const [result, setResult] = useState<number[][]>([[]]);
    const [data, setData] = useState<{ year: number; elements: number }[]>([]);

    useEffect(() =>
        setData(result[0].map((el: number, i: number) => ({year: result[1][i], elements: el}))), [result])

    //TODO: add to UI, and if apply curing add "Curing diffusivity"
    const onSubmit = async (data: any) => setResult(await doFetch('/corrode', {
        corner_diff_boost: 0.003,
        circle_diff_boost: 0.8,
        crack_rate: 0.05,
        crack_diff: 0.002,
        halo_effect: 2.6,
        curing_rate: 0.001,
        concrete_resistivity: 10,
        concrete_aging_factor: 0.3,
        concrete_aging_t0: 10,
        apply_halo: true,
        curing_diff: {
            mean: 0.01,
            stdev: 0.002,
            trunc_low: 0.002,
            trunc_high: 0.1
        },
        ...data
    }))

    return <main>
        <header>
            <h2>Bridge Corrosion Simulator</h2>
            <small>By using this, you agree to not sue us about your bridge.</small>
        </header>
        <br/>
        <Form onSubmit={handleSubmit(onSubmit)} register={register}/>
        <br/>
        {result[0][0] && <Chart data={data}/>}
    </main>;
};

export default App;

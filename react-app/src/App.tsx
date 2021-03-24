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

    const onSubmit = async (data: any) => setResult(await doFetch('/corrode', {
        corner_diff_boost: 0.003,
        circle_diff_boost: 0.8,
        crack_rate: 0.05,
        crack_diff: 0.002,
        ...data
    }))

    return <main>
        <header>
            <h2>Bridge Corrosion Simulator</h2>
            <small>By using this, you agree to not sue us about your bridge.</small>
        </header>
        <Form onSubmit={handleSubmit(onSubmit)} register={register}/>
        <br/>
        {result[0] && <Chart data={data}/>}
    </main>;
};

export default App;

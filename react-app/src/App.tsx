import React from 'react';
import {useForm} from 'react-hook-form';
import {doFetch} from "./ApiClient";
import {Form} from "./components/Form";

const App = () => {
    const {register, handleSubmit} = useForm();

    const onSubmit = async (data: any) => await doFetch('/corrode', {
        corner_diff_boost: 0.003,
        circle_diff_boost: 0.8,
        crack_rate: 0.05,
        crack_diff: 0.002,
        ...data
    })

    return <main>
        <header>
            <h1>Bridge Corrosion Simulator</h1>
            <h2>Parameters</h2>
            <Form onSubmit={handleSubmit(onSubmit)} register={register}/>
        </header>
    </main>;
};

export default App;

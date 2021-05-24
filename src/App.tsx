import React, {useEffect, useState} from "react";
import {Form} from "./components/Form";
import {Chart} from "./components/Chart";

const App = () => {
    const [result, setResult] = useState<number[][]>();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<{ year: number; elements: number }[]>();
    useEffect(() => {
        if (result) setData(result[0].map((el: number, i: number) => ({year: result[1][i], elements: el})))
    }, [result])

    return <main>
        <header>
            <h2>Bridge Corrosion Simulator</h2>
            <small>By using this, you agree to not sue us about your bridge.</small>
        </header>
        <br/>
        <Form setResult={setResult} setLoading={setLoading}/>
        <br/>
        {loading && <>loading...</>}
        {data && !loading && <Chart data={data}/>}
        <br/>
        <footer>Contact us at <a href="mailto:corrosion@smcf.io">corrosion@smcf.io</a>.</footer>
    </main>;
};

export default App;

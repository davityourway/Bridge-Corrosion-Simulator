import {CartesianGrid, Label, Line, LineChart, Tooltip, XAxis, YAxis} from "recharts";
import React from "react";

export const Chart = (props: { data: { year: number; elements: number }[] }) => <data>
    <LineChart width={500} height={200} data={props.data} margin={{top: 5, right: 30, left: 20, bottom: 10}}>
        <XAxis dataKey="year">
            <Label value="Time (years)" offset={-10} position="insideBottom"/>
        </XAxis>
        <Line type="monotone" dataKey="elements" stroke="#8884d8" dot={false}/>
        <YAxis/>
        <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
        <Tooltip/>
    </LineChart>
</data>;

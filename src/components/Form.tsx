import React, {useState} from "react";
import {Input, PropertyInput} from "./Input";

interface FormProps {
    onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    register: any
}

enum PylonShape {
    RECTANGLE = 'Rectangle',
    CIRCLE = 'Circle',
    SLAB = 'Slab'
}

export const Form: React.FC<FormProps> = props => {
    const [pylonShape, setShape] = useState<PylonShape>(PylonShape.CIRCLE);
    return <form onSubmit={props.onSubmit}>
        <table>
            <tbody>
            <Input fieldName={"simulation_time"} label={"Simulation time (years)"} register={props.register}/>
            <Input fieldName={"pylons"} label={"Number of pylons"} register={props.register}/>
            <tr>
                <td><label>Pylon shape: </label></td>
                <td><select name={"shape"} value={pylonShape} ref={props.register} onChange={event => {
                    setShape(event.target.value as PylonShape)
                }}>
                    <option value={PylonShape.CIRCLE}>{PylonShape.CIRCLE}</option>
                    <option value={PylonShape.RECTANGLE}>{PylonShape.RECTANGLE}</option>
                    <option value={PylonShape.SLAB}>{PylonShape.SLAB}</option>
                </select></td>
            </tr>
            {pylonShape === PylonShape.CIRCLE &&
            <Input fieldName={"radius"} label={"Radius (ft.)"} register={props.register}/>
            }
            {pylonShape === PylonShape.RECTANGLE || pylonShape === PylonShape.SLAB && <>
                <Input label={"Width (ft.)"} fieldName={"width1"} register={props.register}/>
                <Input label={"Length (ft.)"} fieldName={"width2"} register={props.register}/>
            </>}
            {
                pylonShape !== PylonShape.SLAB &&
                <Input fieldName={"height"} label={"Corrosion zone height (ft.)"} register={props.register}/>
            }
            <Input label={"Nitrite concentration"} fieldName={"nitrite_conc"} register={props.register}/>
            <Input label={"Apply curing"} inputType={'checkbox'} fieldName={"apply_curing"} register={props.register}/>
            <tr>
                <td/>
                <td>Mean</td>
                <td>Standard Deviation</td>
                <td>Lower Bound</td>
                <td>Upper Bound</td>
            </tr>
            <PropertyInput label={"Cover"} fieldName={"cover"} register={props.register}/>
            <PropertyInput label={"Diffusivity"} fieldName={"diff"} register={props.register}/>
            <PropertyInput label={"CL threshold concentration"} fieldName={"cl_thresh"} register={props.register}/>
            <PropertyInput label={"CL surface concentration"} fieldName={"cl_conc"} register={props.register}/>
            <PropertyInput label={"Propagation time (years)"} fieldName={"prop_time"} register={props.register}/>
            </tbody>
        </table>
        <input type={"submit"} value={"Corrode!"}/>
    </form>;
}

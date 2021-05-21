import React, {Dispatch, SetStateAction, useState} from "react";
import {Input, InputLabel, PropertyInput} from "./Input";
import {doFetch} from "../ApiClient";
import {useForm} from "react-hook-form";
import {defaults} from "../resources/test_params";

interface FormProps {
    setResult: Dispatch<SetStateAction<any>>
}

enum PylonShape {
    RECTANGLE = 'Rectangle',
    CIRCLE = 'Circle',
    SLAB = 'Slab'
}

export const Form: React.FC<FormProps> = props => {
    const [pylonShape, setShape] = useState<PylonShape>(PylonShape.CIRCLE);
    const [applyCuring, setApplyCuring] = useState(true);
    const {handleSubmit, register, setValue} = useForm();
    const onSubmit = async (data: any) => props.setResult(await doFetch('/corrode', {
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
    const populateDefaultValues = async () => {
        await setShape(defaults.shape as PylonShape)
        await setValue('shape', PylonShape.SLAB)
        await Object.entries(defaults).forEach(([key, value]) => setValue(key, value))
        setApplyCuring(true)
        setValue('apply_curing', 'checked')
    }
    return <form onSubmit={handleSubmit(onSubmit)}>
        <table>
            <tbody>
            <Input fieldName={"simulation_time"} label={"Simulation time (years)"} register={register}/>
            <Input fieldName={"pylons"} label={"Number of pylons"} register={register}/>
            <tr>
                <td><label>Pylon shape: </label></td>
                <td><select name={"shape"} value={pylonShape} ref={register} onChange={event => {
                    setShape(event.target.value as PylonShape)
                }}>
                    <option value={PylonShape.CIRCLE}>{PylonShape.CIRCLE}</option>
                    <option value={PylonShape.RECTANGLE}>{PylonShape.RECTANGLE}</option>
                    <option value={PylonShape.SLAB}>{PylonShape.SLAB}</option>
                </select></td>
            </tr>
            {pylonShape === PylonShape.CIRCLE &&
            <Input fieldName={"radius"} label={"Radius (ft.)"} register={register}/>
            }
            {(pylonShape === PylonShape.RECTANGLE || pylonShape === PylonShape.SLAB) && <>
                <Input label={"Width (ft.)"} fieldName={"width1"} register={register}/>
                <Input label={"Length (ft.)"} fieldName={"width2"} register={register}/>
            </>}
            <Input label={"Nitrite concentration (lbs/yd^3)"} fieldName={"nitrite_conc"} register={register}/>
            <tr>
                <InputLabel label="Apply curing"/>
                <td><input type='checkbox' checked={applyCuring} name='apply_curing' ref={register}
                           onChange={event => setApplyCuring(event.target.checked)}/></td>
            </tr>
            <tr>
                <td/>
                <td>Mean</td>
                <td>Standard Deviation</td>
                <td>Lower Bound</td>
                <td>Upper Bound</td>
            </tr>
            {applyCuring && <PropertyInput label={"Curing diffusivity"} fieldName={"curing_diff"} register={register}/>}
            <PropertyInput label={"Cover (in.)"} fieldName={"cover"} register={register}/>
            <PropertyInput label={"Diffusivity (in^2/yr)"} fieldName={"diff"} register={register}/>
            <PropertyInput label={"CL threshold (lbs/yd^3)"} fieldName={"cl_thresh"} register={register}/>
            <PropertyInput label={"CL surface concentration (lbs/yd^3)"} fieldName={"cl_conc"}
                           register={register}/>
            <PropertyInput label={"Propagation time (years)"} fieldName={"prop_time"} register={register}/>
            </tbody>
        </table>
        <button onClick={populateDefaultValues}>Use defaults</button>
        <input type={"submit"} value={"Corrode!"}/>
    </form>;
}

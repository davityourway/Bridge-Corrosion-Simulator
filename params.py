import enum
import json
from typing import Dict
import pydantic
from pydantic.dataclasses import dataclass
from pydantic import BaseModel

class GaussianParams(BaseModel):
    mean: float
    stdev: float
    trunc_low: float
    trunc_high: float

class Params(BaseModel):
    pylon_shape: str
    apply_curing: bool
    apply_halo: bool
    concrete_aging_t0: int
    nitrite_conc: float
    width1: int
    width2: int
    height: int
    corner_diff_boost: float
    crack_rate: float
    crack_diff: float
    pylons: int
    simulation_time: int
    halo_effect: float
    concrete_resistivity: int
    concrete_aging_factor: float
    concrete_aging_t0: int
    cover: GaussianParams
    diff: GaussianParams
    curing_diff: GaussianParams
    cl_thresh: GaussianParams
    cl_conc: GaussianParams
    prop_time: GaussianParams



class Shape(enum.Enum):
    RECTANGLE = 'Rectangle'
    CIRCLE = 'Circle'
    SLAB = 'Slab'

print(Params.parse_file(path='test_params.json'))

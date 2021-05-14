import copy
import itertools
import json
import math
import os
import timeit
from typing import Dict, Tuple

import matplotlib.pyplot as plt
import numpy
from flask import Flask
from flask import request
from flask_cors import CORS
from scipy import special

# TO DO
# Get Sagues charts
# bench test number of possible elements (Begun)
# include time readout (begun)
app = Flask(__name__, static_folder='build/', static_url_path='/')
app.debug = 'DEBUG' in os.environ
CORS(app)


@app.route('/api/corrode', methods=['POST'])
def corrode():
    bridge = Bridge(request.json)
    return json.dumps(bridge.get_corroded_sections(bridge.sim_time))


def run_simulation(params_json: str) -> 'Bridge':
    with open(params_json, "r") as read_file:
        params = json.load(read_file)

    return Bridge(params)


class Bridge:
    def __init__(self, params: Dict):
        self.pylon_shape = params['shape']
        self.apply_curing = params['apply_curing']
        self.apply_halo = params['apply_halo']
        self.concrete_aging_t0 = params['concrete_aging_t0']
        self.concrete_aging_factor = params['concrete_aging_factor']
        self.mat_shape = self.get_matrix_shape(params)
        self.num_elems = self.mat_shape[0] * self.mat_shape[1] * self.mat_shape[2]
        self.cover = self.populate_matrix(params, 'cover')
        self.diff = self.populate_matrix(params, 'diff') if not self.apply_curing else self.populate_matrix(params,
                                                                                                            'curing_diff')
        self.cl_thresh = self.populate_matrix(params, 'cl_thresh')
        self.cl_conc = self.populate_matrix(params, 'cl_conc')
        self.prop_time = self.populate_matrix(params, 'prop_time')
        self.nitrite_conc = float(params['nitrite_conc'])
        self.corr_time = self.generate_corrosion_matrix()
        self.sim_time = int(params['simulation_time']) + 1
        self.halo_effect = params['halo_effect']
        self.concrete_resistivity = params['concrete_resistivity']
        self.chl_thresh_multiplier = 3 - math.log(self.concrete_resistivity)
        self.curing_rate = params['curing_rate']
        self.needs_maintenance = [False for _ in range(self.mat_shape[0])]
        self.run_sim_with_optional_effects(self.apply_curing, self.apply_halo)

    def generate_corrosion_matrix(self):
        if self.nitrite_conc == 0:
            return numpy.where(self.cl_thresh > self.cl_conc, math.inf,
                               numpy.square(self.cover) / (4 * self.diff * numpy.square(
                                   special.erfinv(1 - self.cl_thresh / self.cl_conc))) + self.prop_time)
        else:
            return numpy.square(self.cover) / (4 * self.diff * numpy.square(
                special.erfinv(1 - (self.nitrite_conc * (self.cl_conc - self.cl_thresh) /
                                    (self.nitrite_conc + self.cl_conc) + self.cl_thresh) /
                               self.cl_conc))) + self.prop_time

    def populate_matrix(self, params, param: str):
        norm_mat = self.get_element_matrix(self.mat_shape)
        full_mat = norm_mat * float(params[param]["stdev"])
        full_mat = full_mat + float(params[param]["mean"])
        if param == 'diff':
            self.apply_diff_boost(params, full_mat)
            full_mat = self.distribute_cracks(params, full_mat)
        full_mat = self.truncate_values(params, param, full_mat)
        return full_mat

    def distribute_cracks(self, params, diff_mat: numpy.array):
        crackmat = numpy.random.random(self.mat_shape)
        diff_mat = numpy.where(crackmat > params['crack_rate'], diff_mat, diff_mat + params['crack_diff'])
        return diff_mat

    def apply_diff_boost(self, params: Dict, diff_mat: numpy.array):
        if params['shape'] == 'Rectangle':
            perimeter = self.mat_shape[2]
            sections = perimeter // 4
            corners = [x * sections for x in range(4)]
            for i in range(4):
                diff_mat[:, :, corners[i]] *= float(params['corner_diff_boost'])
        elif params['shape'] == 'Circle':
            diff_mat *= float(params['circle_diff_boost'])
        else:
            print('Error: Shape not valid')
            raise

    def truncate_values(self, params: Dict, param: str, full_mat: numpy.array):
        full_mat = numpy.maximum(full_mat, float(params[param]["trunc_low"]))
        full_mat = numpy.minimum(full_mat, float(params[param]["trunc_high"]))
        return full_mat

    def get_matrix_shape(self, params: Dict) -> Tuple[int, int, int]:
        if params['shape'] == 'Rectangle':
            hor_elem = int(2 * (float(params['width1']) + float(params['width2'])))
        elif params['shape'] == 'Circle':
            hor_elem = int(2 * math.pi * float(params['radius']))
        elif params['shape'] == 'Slab':
            hor_elem = int(params['width1'])
        else:
            print("Error: Shape not valid")
            raise
        return int(params['pylons']), int(params['width2'] if params['shape'] == 'Slab' else params['height']), hor_elem

    def get_element_matrix(self, elements: Tuple[int, int, int]) -> numpy.array:
        return numpy.random.normal(0, 1, elements)

    def get_corroded_sections(self, time: int):
        corroded = []
        times = []
        for i in range(time):
            corroded.append(numpy.count_nonzero(self.corr_time < i))
            times.append(i)
        return corroded, times

    def plot_corroded_without_halo(self):
        corroded, time = self.get_corroded_sections(self.sim_time)
        percent_corroded = [(cored / self.num_elems) * 100 for cored in corroded]
        plt.plot(percent_corroded)
        plt.xlabel('Time (years)')
        plt.ylabel('Percentage of elements showing spalls')
        plt.show()

    def plot_corroded_with_halo(self):
        self.apply_halo_effect()
        corroded, time = self.get_corroded_sections(self.sim_time)
        percent_corroded = [(cored / self.num_elems) * 100 for cored in corroded]
        plt.plot(percent_corroded)
        plt.xlabel('Time (years)')
        plt.ylabel('Percentage of elements showing spalls')
        plt.show()

    def apply_halo_effect(self, t: int):
        directions = [-1, 0, 1]
        directions = set(itertools.product(directions, directions))
        directions.remove((0, 0))
        corroded = numpy.where((self.corr_time <= t) & (self.corr_time >= t - 1))
        corroded = [(corroded[0][i], corroded[1][i], corroded[2][i]) for i in range(len(corroded[0]))]
        for pos in corroded:
            for dir in directions:
                i = pos[1] + dir[0]
                j = pos[2] + dir[1] if self.pylon_shape == 'Slab' else (pos[2] + dir[1]) % self.mat_shape[2]
                if 0 <= i < self.mat_shape[1] and 0 <= j < self.mat_shape[2] and self.corr_time[pos[0], i, j] > t:
                    self.cl_thresh[pos[0], i, j] *= self.chl_thresh_multiplier

    def apply_curing_effect(self, original_diff: numpy.array, t: int):
        return numpy.where(self.corr_time > t,
                           original_diff * (t / self.concrete_aging_t0) ** self.concrete_aging_factor, self.diff)

    def run_sim_with_optional_effects(self, apply_curing: bool, apply_halo: bool):
        original_diff = copy.deepcopy(self.diff)
        for t in range(1, self.sim_time + 1):
            if apply_curing:
                # for i in range(3):
                #     self.diff = self.apply_curing_effect(original_diff, t+i*.25)
                self.diff = self.apply_curing_effect(original_diff, t)
            if apply_halo:
                self.apply_halo_effect(t)
            self.corr_time = self.generate_corrosion_matrix()
            print(f"Hi I'm in year {t}")


@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/<path:path>')
def static_file(path):
    return app.send_static_file(path)


if __name__ == '__main__':
    test_bridge = run_simulation("test_params.json")
    test_bridge.plot_corroded_without_halo()
    # print(timeit.Timer("run_simulation('test_params.json')", 'from __main__ import run_simulation').timeit(1))

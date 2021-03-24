import json
import math
import numpy
import matplotlib.pyplot as plt
from typing import Dict, Tuple
from scipy import special
from flask import Flask
from flask_cors import CORS
from flask import request

# TO DO
# Corrosion chartp
# Maintenance Flag
# Time step
app = Flask(__name__)
CORS(app)


@app.route('/api/corrode', methods=['POST'])
def corrode():
    print(request.json)
    bridge = Bridge(request.json)
    return json.dumps(bridge.get_corroded_sections(bridge.sim_time))


def run_simulation(params_json: str) -> 'Bridge':
    with open(params_json, "r") as read_file:
        params = json.load(read_file)

    return Bridge(params)


class Bridge:
    def __init__(self, params: Dict):
        self.pylon_shape = params['shape']
        self.mat_shape = self.get_matrix_shape(params)
        self.cover = self.populate_matrix(params, 'cover')
        self.diff = self.populate_matrix(params, 'diff')
        self.cl_thresh = self.populate_matrix(params, 'cl_thresh')
        self.cl_conc = self.populate_matrix(params, 'cl_conc')
        self.prop_time = self.populate_matrix(params, 'prop_time')
        self.nitrite_conc = float(params['nitrite_conc'])
        self.corr_time = self.generate_corrosion_matrix()
        self.sim_time = int(params['simulation_time'])
        self.needs_maintenance = [False for col in range(self.mat_shape[0])]

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
            self.distribute_cracks(params, full_mat)
        full_mat = self.truncate_values(params, param, full_mat)
        return full_mat

    def distribute_cracks(self, params, diff_mat: numpy.array):
        crackmat = numpy.random.random(self.mat_shape)
        diff_mat = numpy.where(crackmat > params['crack_rate'], diff_mat, diff_mat + params['crack_diff'])

    def apply_diff_boost(self, params: Dict, diff_mat: numpy.array):
        if params['shape'] == 'Rectangle':
            perimeter = self.mat_shape[2]
            sections = perimeter // 4
            corners = [x * sections for x in range(4)]
            for i in range(4):
                diff_mat[:, :, corners] *= float(params['corner_diff_boost'])
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
            vert_elem = int(params['height'])
            hor_elem = int(2 * (float(params['width1']) + float(params['width2'])))
        elif params['shape'] == 'Circle':
            vert_elem = int(params['height'])
            hor_elem = int(2 * math.pi * float(params['radius']))
        else:
            print("Error: Shape not valid")
            raise
        return int(params['pylons']), vert_elem, hor_elem

    def get_element_matrix(self, elements: Tuple[int, int, int]) -> numpy.array:
        return numpy.random.normal(0, 1, elements)

    def get_corroded_sections(self, time: int):
        corroded = []
        times = []
        print(self.corr_time)
        for i in range(time):
            corroded.append(numpy.count_nonzero(self.corr_time < i))
            times.append(i)
        return corroded, times

    def plot_corroded(self):
        corroded, time = self.get_corroded_sections(self.sim_time)
        plt.plot(time, corroded)
        plt.xlabel('Time (years)')
        plt.ylabel('Number of elements showing spalls')
        plt.show()


if __name__ == '__main__':
    test_bridge = run_simulation("test_params.json")
    test_bridge.plot_corroded()
    print(test_bridge.corr_time.shape)

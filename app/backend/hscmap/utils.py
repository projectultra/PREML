from cmath import isfinite
import math
from typing import Any
import numpy
import uuid
import pandas


def as_json(o):
    if isinstance(o, list):
        return [as_json(c) for c in o]
    elif isinstance(o, tuple):
        return (as_json(c) for c in o)
    elif isinstance(o, dict):
        return {k: as_json(v) for k, v in o.items()}
    elif isinstance(o, numpy.ndarray):
        return safe(o.tolist())
    elif isinstance(o, pandas.Series):
        return safe(o.tolist())
    return o


def safe(o: Any):
    if isinstance(o, list):
        return map(safe, o)
    if isinstance(o, float):
        if math.isfinite(o):
            return o
        else:
            return str(o)
    if isinstance(o, dict):
        return {k: safe(v) for k, v in o.items()}
    return o


def uid():
    '''
    unique ID
    '''
    return str(uuid.uuid1())

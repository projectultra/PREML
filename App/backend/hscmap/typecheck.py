import functools
from numbers import Real

V4 = [Real, Real, Real, Real]


class ValidationError(Exception):
    pass


class LengthMismatch(ValidationError):
    pass


class TypeMismatch(ValidationError):
    pass


class TypeCheck:
    def __init__(self, *typedefs, **kwtypedefs):
        assert len(kwtypedefs) == 0
        self.typedefs = typedefs
        self.kwtypedefs = kwtypedefs

    def __call__(self, *args, **kwargs):
        assert len(kwargs) == 0
        _check(self.typedefs, args)


def _check(typedef, arg, *, context=''):
    if isinstance(typedef, (list, tuple)):
        _check_list(list(typedef), list(arg), context)
    else:
        if not isinstance(arg, typedef):
            raise TypeMismatch(
                f'expected {typedef.__name__} but got {repr(arg)}{context}')


def _check_list(typedefs, args, context):
    if not isinstance(args, list):
        raise TypeMismatch(f'list expected but got {repr(args)}')
    if len(typedefs) != len(args):
        raise LengthMismatch(
            f'expected {len(typedefs)} args but got {len(args)}{context}')
    for i, (typedef, arg) in enumerate(zip(typedefs, args)):
        _check(typedef, arg, context=f' in {i}th arg{context}')

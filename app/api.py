"""
This is a simple API module that provides basic arithmetic operations and a greeting function.
"""


def hello_world():
    """
    This function returns Hello World!.
    """
    return "Hello, World!"


def add(a, b):
    """
    This function adds two numbers.
    """
    return a + b


def subtract(a, b):
    """
    This function subtracts two numbers.
    """
    return a - b


def multiply(a, b):
    """
    This function multiplies two numbers.
    """
    return a * b


def divide(a, b):
    """
    This function divides two numbers.
    It checks for division by zero and returns an error message if so.
    """
    if b == 0:
        return "Error: Division by zero"
    return a / b

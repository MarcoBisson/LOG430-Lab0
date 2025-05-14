### This is a simple API module that provides basic arithmetic operations and a greeting function.

"""
This function returns Hello World!.
"""
def helloWorld():
    return "Hello, World!"

"""
This function adds two numbers.
"""
def add(a, b):
    return a + b

"""
This function subtracts two numbers.
"""
def subtract(a, b):
    return a - b

"""
This function multiplies two numbers.
"""
def multiply(a, b):
    return a * b

"""
This function divides two numbers.
"""
def divide(a, b):
    if b == 0:
        return "Error: Division by zero"
    return a / b
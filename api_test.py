"""
This is a test file for the API.
It contains unit tests for the functions defined in the API module.
"""

from api import helloWorld, add, subtract, multiply, divide

"""
This function tests the helloWorld function.
"""
def test_helloWorld():
    assert helloWorld() == "Hello, World!"

"""
This function tests the add function.
It checks if the addition of two numbers is correct.
It also checks for negative numbers and zero.
"""
def test_add():
    assert add(2, 2) == 4
    assert add(-2, -1) == -3
    assert add(1, 8) == 9
    assert add(3, 10) == 13

"""
This function tests the subtract function.
It checks if the subtraction of two numbers is correct.
It also checks for negative numbers and zero.
"""
def test_subtract():
    assert subtract(12, 3) == 9
    assert subtract(2, 2) == 0
    assert subtract(-2, -1) == -1
    assert subtract(1, 8) == -7
    assert subtract(3, 10) == -7

"""
This function tests the multiply function.
It checks if the multiplication of two numbers is correct.
It also checks for negative numbers and zero.
"""
def test_multiply():
    assert multiply(2, 3) == 6
    assert multiply(-2, -1) == 2
    assert multiply(1, 0) == 0
    assert multiply(3, 10) == 30
    assert multiply(-3, -10) == 30
    assert multiply(-3, 10) == -30

"""
This function tests the divide function.
It checks if the division of two numbers is correct.
It also checks for negative numbers and zero.
"""
def test_divide():
    assert divide(6, 3) == 2
    assert divide(-6, -3) == 2
    assert divide(1, 0) == "Error: Division by zero"
    assert divide(3, 10) == 0.3
    assert divide(-3, -10) == 0.3
    assert divide(-3, 10) == -0.3
"""
This is the main module for the API project.
"""

from app.api import hello_world, add, subtract, multiply, divide

if __name__ == "__main__":
    print(hello_world())
    print("Add 5 + 3=", add(5, 3))
    print("Subtract 5 - 3=", subtract(5, 3))
    print("Multiply 5 * 3=", multiply(5, 3))
    print("Divide 5 / 3=", divide(5, 3))
    print("Divide 5 / 0=", divide(5, 0))

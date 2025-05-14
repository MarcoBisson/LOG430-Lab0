from api import hello_world, add, subtract, multiply, divide

if __name__ == "__main__":
    """
    This is the main function that runs when the script is executed
    It runs the API functions and prints their results.
    """
    
    print(hello_world())
    print("Add 5 + 3=", add(5, 3))
    print("Subtract 5 - 3=", subtract(5, 3))
    print("Multiply 5 * 3=", multiply(5, 3))
    print("Divide 5 / 3=", divide(5, 3))
    print("Divide 5 / 0=", divide(5, 0))

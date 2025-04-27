from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import onnxruntime as ort

# Load ONNX model
session = ort.InferenceSession(
    r"app\backend\main_network.onnx", providers=["CPUExecutionProvider"]
)

# Define FastAPI app
app = FastAPI()


# Define input format
class InputData(BaseModel):
    data: list  # expecting a list of floats


@app.post("/predict")
def predict(input_data: InputData):
    # Convert input to NumPy array
    input_array = np.array(input_data.data, dtype=np.float32).reshape(1, -1)

    # Run inference
    output = session.run(None, {"input": input_array})

    # Return output
    return {"prediction": output[0].tolist()}


if __name__ == "__main__":
    import requests

    url = "http://localhost:8000/predict"
    payload = {"data": [0.1, 0.2, 0.3, 0.4, 0.5]}
    response = requests.post(url, json=payload)
    print(response.json())

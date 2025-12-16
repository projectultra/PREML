from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import onnxruntime as ort

# Load ONNX model
session = ort.InferenceSession(r"main_network.onnx", providers=["CPUExecutionProvider"])

# Define FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Define input format
class InputData(BaseModel):
    data: list  # expecting a list of floats


@app.post("/predict")
def predict(input_data: InputData):
    # Convert input to NumPy array
    input_array = np.array(input_data.data, dtype=np.float32).reshape(1, -1)
    # Normalize input data
    input_array = (input_array - np.mean(input_array)) / (np.std(input_array) + 1e-8)
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

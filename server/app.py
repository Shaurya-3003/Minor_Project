from flask import Flask
from flask import request
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import base64
import PIL.Image as Image
import io


app=Flask(__name__)
CORS(app)

MODEL_PATH = 'models/model.h5'
model = tf.keras.models.load_model(MODEL_PATH)
model.make_predict_function() 
classes=['Aluminium', 'Carton', 'Glass', 'Organic Waste', 'Other Plastics', 'Paper and Cardboard', 'Plastic', 'Textiles', 'Wood']


@app.route("/", methods=["POST"])
def prediction():
    image_data=request.get_json()["data"]
    image_data=bytearray(image_data[23:].encode())
    image_data=base64.b64decode((image_data))
    img=Image.open(io.BytesIO(image_data))
    img.save('image.jpeg')
    path='image.jpeg'
    img = tf.keras.preprocessing.image.load_img(path, target_size=(256, 256))
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    # img_array = tf.keras.applications.inception_v3.preprocess_input(img_array)
    img_array = tf.expand_dims(img_array, 0) 
    predictions = model.predict(img_array)
    return classes[np.argmax(predictions)]

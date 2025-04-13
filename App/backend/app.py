from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import requests
from hscmap.window import Window
from hscmap.config import config
import uuid
import numpy as np
import io
import astropy.io.fits as afits

app = Flask(__name__)
# Allow CORS for all /api/ endpoints, including nested paths
CORS(app, supports_credentials=True)

windows = {}

@app.route('/hscmap/<path:path>')
def proxy_hscmap(path):
    url = f'https://hscmap.mtk.nao.ac.jp/hscMap4/{path}'
    try:
        resp = requests.get(url)
        return Response(resp.content, content_type=resp.headers['content-type'])
    except requests.RequestException as e:
        return jsonify({'error': str(e)}), 502

@app.route('/api/window/new', methods=['POST'])
def new_window():
    data = request.json
    title = data.get('title', 'HSC Map')
    window_id = str(uuid.uuid4())
    window = Window(window_id=window_id, title=title)
    windows[window_id] = window
    return jsonify({
        'id': window_id,
        'url': config.default_url,
        'title': title
    })

@app.route('/api/window/<window_id>/jump_to', methods=['POST'])
def jump_to(window_id):
    data = request.json
    window = windows.get(window_id)
    if not window:
        return jsonify({'error': 'Window not found'}), 404
    ra = data.get('ra')
    dec = data.get('dec')
    fov = data.get('fov')
    window.jump_to(ra, dec, fov)
    return jsonify({'status': 'success'})

@app.route('/api/window/<window_id>/catalog/new', methods=['POST'])
def new_catalog(window_id):
    data = request.json
    window = windows.get(window_id)
    if not window:
        return jsonify({'error': 'Window not found'}), 404
    ra = np.array(data.get('ra', []))
    dec = np.array(data.get('dec', []))
    name = data.get('name', f'catalog-{len(window.catalogs.members)}')
    columns = data.get('columns', {})
    color = data.get('color', [0, 1, 0, 0.5])
    catalog = window.catalogs.new(ra, dec, name=name, columns=columns, color=color)
    return jsonify({'id': catalog._id, 'name': catalog.name})

@app.route('/api/window/<window_id>/fits/new', methods=['POST'])
def new_fits(window_id):
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    window = windows.get(window_id)
    if not window:
        return jsonify({'error': 'Window not found'}), 404
    name = request.form.get('name', f'image-{len(window.fits_images.members)}')
    try:
        buf = io.BytesIO(file.read())
        hdu = afits.open(buf)[0]
        fits_image = window.fits_images.from_hdu(hdu, name=name)
        return jsonify({'id': fits_image._id, 'name': fits_image.name})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/window/<window_id>/selection', methods=['POST'])
def handle_selection(window_id):
    data = request.json
    window = windows.get(window_id)
    if not window:
        return jsonify({'error': 'Window not found'}), 404
    selection_type = data.get('type')
    if selection_type == 'point':
        ra = data.get('ra')
        dec = data.get('dec')
        catalog_id = data.get('catalog_id')
        index = data.get('index')
        print(f"Received point selection: catalog_id={catalog_id}, index={index}, ra={ra}, dec={dec}")
        return jsonify({'status': 'success', 'ra': ra, 'dec': dec})
    elif selection_type == 'region':
        area = data.get('area')
        c0, c1 = area
        print(f"Received region selection: c0={{a={c0['a']}, d={c0['d']}}}, c1={{a={c1['a']}, d={c1['d']}}}")
        return jsonify({'status': 'success', 'area': area})
    else:
        return jsonify({'error': 'Invalid selection type'}), 400

@app.route('/api/window/<window_id>/callback/<cbid>', methods=['POST'])
def handle_callback(window_id, cbid):
    window = windows.get(window_id)
    if not window:
        return jsonify({'error': 'Window not found'}), 404
    data = request.json
    args = data.get('args', [])
    window._callback.call(cbid, args)
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import requests
import json
import urllib.request
import urllib.error
import urllib.parse
import time
import os
import csv
from io import StringIO
from dotenv import load_dotenv
from hscmap.window import Window
from hscmap.config import config
import uuid
import numpy as np
import io
import astropy.io.fits as afits

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)

windows = {}

# HSC API configuration
HSC_API_URL = 'https://hsc-release.mtk.nao.ac.jp/datasearch/api/catalog_jobs/'
HSC_RELEASE_VERSION = 'pdr3'

# HSC credentials from .env
HSC_USER = os.getenv('HSC_USER')
HSC_PASSWORD = os.getenv('HSC_PASSWORD')

def http_json_post(url, data):
    """Helper function to send JSON POST requests to HSC API."""
    data['clientVersion'] = 20190514.1
    post_data = json.dumps(data).encode('utf-8')
    headers = {'Content-type': 'application/json'}
    req = urllib.request.Request(url, post_data, headers)
    try:
        with urllib.request.urlopen(req) as res:
            return json.load(res)
    except urllib.error.HTTPError as e:
        raise Exception(f"HTTP Error {e.code}: {e.read().decode()}")

def submit_job(credential, sql, out_format='csv'):
    """Submit a job to the HSC API."""
    print(f"submit_job: Action=Submitting job with user={credential['account_name']}")
    url = f"{HSC_API_URL}submit"
    catalog_job = {
        'sql': sql,
        'out_format': out_format,
        'include_metainfo_to_body': True,
        'release_version': HSC_RELEASE_VERSION,
    }
    post_data = {'credential': credential, 'catalog_job': catalog_job, 'nomail': True, 'skip_syntax_check': False}
    return http_json_post(url, post_data)

def job_status(credential, job_id):
    """Check the status of an HSC API job."""
    print(f"job_status: Action=Checking status for job_id={job_id}")
    url = f"{HSC_API_URL}status"
    post_data = {'credential': credential, 'id': job_id}
    return http_json_post(url, post_data)

def download_job(credential, job_id):
    """Download the results of an HSC API job."""
    print(f"download_job: Action=Downloading results for job_id={job_id}")
    url = f"{HSC_API_URL}download"
    post_data = {'credential': credential, 'id': job_id}
    req = urllib.request.Request(url, json.dumps(post_data).encode('utf-8'), {'Content-type': 'application/json'})
    with urllib.request.urlopen(req) as res:
        return res.read().decode('utf-8').strip()

def block_until_job_finishes(credential, job_id):
    """Poll until the HSC API job completes."""
    print(f"block_until_job_finishes: Action=Polling job_id={job_id}")
    max_interval = 300  # 5 minutes
    interval = 1
    while True:
        time.sleep(interval)
        job = job_status(credential, job_id)
        if job['status'] == 'error':
            raise Exception(f"Query error: {job.get('error', 'Unknown error')}")
        if job['status'] == 'done':
            return
        interval = min(interval * 2, max_interval)

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

@app.route('/api/queryGalaxies', methods=['POST'])
def query_galaxies():
    data = request.json
    ra = data.get('ra')
    dec = data.get('dec')
    radius = data.get('radius', 10 / 3600)  # Default: 10 arcseconds
    print(f"query_galaxies: Received RA={ra}, Dec={dec}, Radius={radius}")

    if not all([ra is not None, dec is not None]):
        return jsonify({'error': 'RA and Dec are required'}), 400

    if not HSC_USER or not HSC_PASSWORD:
        print("query_galaxies: Error: HSC credentials not found in .env")
        return jsonify({'error': 'HSC credentials not configured'}), 500

    credential = {'account_name': HSC_USER, 'password': HSC_PASSWORD}

    # Construct SQL query for galaxies within radius
    sql = f"""
    SELECT object_id, ra, dec, r_cmodel_mag
    FROM pdr3_wide.forced
    WHERE coneSearch(coord, {ra}, {dec}, {radius * 3600})
    AND isprimary
    AND r_cmodel_mag < 24
    LIMIT 100
    """

    try:
        # Submit job
        print(f"query_galaxies: Submitting SQL query: {sql}")
        job = submit_job(credential, sql, out_format='csv')
        job_id = job['id']
        print(f"query_galaxies: Job submitted, id={job_id}")

        # Wait for job to complete
        block_until_job_finishes(credential, job_id)
        print(f"query_galaxies: Job {job_id} completed")

        # Download results
        result_csv = download_job(credential, job_id)
        print(f"query_galaxies: Downloaded results, raw_csv={result_csv}")

        # Split CSV lines
        csv_lines = result_csv.splitlines()
        if not csv_lines:
            print("query_galaxies: Error: Empty CSV response")
            return jsonify({'galaxies': [], 'warning': 'No data returned from HSC API'}), 200

        # Find the header row
        header_row = None
        header_index = -1
        expected_header = 'object_id,ra,dec,r_cmodel_mag'
        for i, line in enumerate(csv_lines):
            cleaned_line = line.strip().replace('\ufeff', '')  # Remove BOM
            # Accept header with or without '#'
            if cleaned_line == expected_header or cleaned_line == f'# {expected_header}':
                header_row = expected_header  # Use clean header
                header_index = i
                print(f"query_galaxies: Found header at line {i}: '{cleaned_line}'")
                break
            print(f"query_galaxies: Checking line {i}: '{cleaned_line}'")

        if not header_row:
            print("query_galaxies: Error: Header row 'object_id,ra,dec,r_cmodel_mag' not found")
            return jsonify({'galaxies': [], 'warning': 'CSV header not found'}), 200

        # Get data rows after header
        data_lines = [line.strip() for line in csv_lines[header_index + 1:] if line.strip() and not line.strip().startswith('#')]
        if not data_lines:
            print("query_galaxies: Error: No data rows after header")
            return jsonify({'galaxies': [], 'warning': 'No data rows found'}), 200

        # Parse CSV with DictReader
        reader = csv.DictReader([header_row] + data_lines)
        headers = reader.fieldnames
        print(f"query_galaxies: CSV headers={headers}")

        if not headers:
            print("query_galaxies: Error: No headers parsed")
            return jsonify({'galaxies': [], 'warning': 'Invalid CSV format'}), 200

        # Check expected columns
        expected_columns = ['object_id', 'ra', 'dec', 'r_cmodel_mag']
        if not all(col in headers for col in expected_columns):
            print(f"query_galaxies: Error: Missing expected columns, found={headers}")
            return jsonify({'galaxies': [], 'warning': f"Expected columns {expected_columns}, got {headers}"}), 200

        # Parse rows
        galaxies = []
        for row in reader:
            try:
                galaxies.append({
                    'id': row['object_id'],
                    'ra': float(row['ra']),
                    'dec': float(row['dec']),
                    'magnitude': float(row['r_cmodel_mag']) if row['r_cmodel_mag'] else 0.0,
                    'distance': 0.0  # Placeholder
                })
            except (KeyError, ValueError) as e:
                print(f"query_galaxies: Warning: Skipping row due to error={str(e)}, row={row}")
                continue

        print(f"query_galaxies: Parsed {len(galaxies)} galaxies, data={galaxies}")
        return jsonify({'galaxies': galaxies})

    except Exception as e:
        print(f"query_galaxies: Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/queryGalaxyDetails', methods=['POST'])
def query_galaxy_details():
    data = request.json
    object_id = data.get('object_id')
    print(f"query_galaxy_details: Received object_id={object_id}")

    if not object_id:
        return jsonify({'error': 'object_id is required'}), 400

    if not HSC_USER or not HSC_PASSWORD:
        print("query_galaxy_details: Error: HSC credentials not found in .env")
        return jsonify({'error': 'HSC credentials not configured'}), 500

    credential = {'account_name': HSC_USER, 'password': HSC_PASSWORD}

    # Construct SQL query for g, r, i, z, y magnitudes
    sql = f"""
    SELECT g_cmodel_mag, r_cmodel_mag, i_cmodel_mag, z_cmodel_mag, y_cmodel_mag
    FROM pdr3_wide.forced
    WHERE object_id = {object_id}
    AND isprimary
    LIMIT 1
    """

    try:
        # Submit job
        print(f"query_galaxy_details: Submitting SQL query: {sql}")
        job = submit_job(credential, sql, out_format='csv')
        job_id = job['id']
        print(f"query_galaxy_details: Job submitted, id={job_id}")

        # Wait for job to complete
        block_until_job_finishes(credential, job_id)
        print(f"query_galaxy_details: Job {job_id} completed")

        # Download results
        result_csv = download_job(credential, job_id)
        print(f"query_galaxy_details: Downloaded results, raw_csv={result_csv}")

        # Split CSV lines
        csv_lines = result_csv.splitlines()
        if not csv_lines:
            print("query_galaxy_details: Error: Empty CSV response")
            return jsonify({'details': {}, 'warning': 'No data returned from HSC API'}), 200

        # Find the header row
        header_row = None
        header_index = -1
        expected_header = 'g_cmodel_mag,r_cmodel_mag,i_cmodel_mag,z_cmodel_mag,y_cmodel_mag'
        for i, line in enumerate(csv_lines):
            cleaned_line = line.strip().replace('\ufeff', '')
            if cleaned_line == expected_header or cleaned_line == f'# {expected_header}':
                header_row = expected_header
                header_index = i
                print(f"query_galaxy_details: Found header at line {i}: '{cleaned_line}'")
                break
            print(f"query_galaxy_details: Checking line {i}: '{cleaned_line}'")

        if not header_row:
            print("query_galaxy_details: Error: Header row 'g_cmodel_mag,r_cmodel_mag,i_cmodel_mag,z_cmodel_mag,y_cmodel_mag' not found")
            return jsonify({'details': {}, 'warning': 'CSV header not found'}), 200

        # Get data rows after header
        data_lines = [line.strip() for line in csv_lines[header_index + 1:] if line.strip() and not line.strip().startswith('#')]
        if not data_lines:
            print("query_galaxy_details: Error: No data rows after header")
            return jsonify({'details': {}, 'warning': 'No data rows found'}), 200

        # Parse CSV with DictReader
        reader = csv.DictReader([header_row] + data_lines)
        headers = reader.fieldnames
        print(f"query_galaxy_details: CSV headers={headers}")

        if not headers:
            print("query_galaxy_details: Error: No headers parsed")
            return jsonify({'details': {}, 'warning': 'Invalid CSV format'}), 200

        # Check expected columns
        expected_columns = ['g_cmodel_mag', 'r_cmodel_mag', 'i_cmodel_mag', 'z_cmodel_mag', 'y_cmodel_mag']
        if not all(col in headers for col in expected_columns):
            print(f"query_galaxy_details: Error: Missing expected columns, found={headers}")
            return jsonify({'details': {}, 'warning': f"Expected columns {expected_columns}, got {headers}"}), 200

        # Parse row
        details = {}
        for row in reader:
            try:
                details = {
                    'g_mag': float(row['g_cmodel_mag']) if row['g_cmodel_mag'] else None,
                    'r_mag': float(row['r_cmodel_mag']) if row['r_cmodel_mag'] else None,
                    'i_mag': float(row['i_cmodel_mag']) if row['i_cmodel_mag'] else None,
                    'z_mag': float(row['z_cmodel_mag']) if row['z_cmodel_mag'] else None,
                    'y_mag': float(row['y_cmodel_mag']) if row['y_cmodel_mag'] else None,
                }
                break  # Only need first row
            except (KeyError, ValueError) as e:
                print(f"query_galaxy_details: Warning: Skipping row due to error={str(e)}, row={row}")
                continue

        print(f"query_galaxy_details: Parsed details, data={details}")
        return jsonify({'details': details})

    except Exception as e:
        print(f"query_galaxy_details: Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
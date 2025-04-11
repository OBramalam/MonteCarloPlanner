from calculation_engine.api import build_api
from waitress import serve 
from flask_cors import CORS
import argparse

arg_parser = argparse.ArgumentParser(description="Run the Flask web application.")

app = build_api()
CORS(app)

arg_parser.add_argument("--port", type=int, default=5000, help="The port to run the web application on.")
arg_parser.add_argument("--host", type=str, default="0.0.0.0", help="The host to run the web application on.")
args = arg_parser.parse_args()

print(f"Starting server on {args.host}:{args.port}")
serve(app, host=args.host, port=args.port)
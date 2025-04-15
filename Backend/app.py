from calculation_engine.api import build_api
from waitress import serve 
from flask_cors import CORS
import argparse
import os

arg_parser = argparse.ArgumentParser(description="Run the Flask web application.")

print("MAX_SIMULATIONS:", os.environ.get("MAX_SIMULATIONS", 1000000))
app = build_api()
CORS(app)

if __name__ == "__main__":
    default_port = int(os.environ.get("PORT", 8080))  # Use env PORT, fallback to 8080
    arg_parser.add_argument("--port", type=int, default=5000, help="The port to run the web application on.")
    arg_parser.add_argument("--host", type=str, default="0.0.0.0", help="The host to run the web application on.")
    args = arg_parser.parse_args()

    print(f"Starting server on {args.host}:{args.port}")
    serve(app, host=args.host, port=args.port)
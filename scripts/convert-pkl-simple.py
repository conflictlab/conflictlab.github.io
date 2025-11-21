#!/usr/bin/env python3
"""
Simple pickle to JSON converter that handles pandas DataFrames
"""
import pickle
import json
import sys

def sanitize(obj):
    """Convert Python objects to JSON-serializable format"""
    # Handle None, str, int, float, bool
    if obj is None or isinstance(obj, (str, int, float, bool)):
        return obj

    # Handle bytes
    if isinstance(obj, bytes):
        try:
            return obj.decode('utf-8', 'ignore')
        except:
            return str(obj)

    # Handle lists/tuples
    if isinstance(obj, (list, tuple)):
        return [sanitize(item) for item in obj]

    # Handle dicts
    if isinstance(obj, dict):
        return {str(k): sanitize(v) for k, v in obj.items()}

    # Handle pandas DataFrame (without importing pandas)
    if hasattr(obj, 'to_dict'):
        try:
            return sanitize(obj.to_dict())
        except:
            pass

    # Handle numpy arrays (without importing numpy)
    if hasattr(obj, 'tolist'):
        try:
            return sanitize(obj.tolist())
        except:
            pass

    # Handle objects with __dict__
    if hasattr(obj, '__dict__'):
        return sanitize(obj.__dict__)

    # Fallback to string representation
    return str(obj)

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python3 convert-pkl-simple.py <input.pkl> <output.json>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    try:
        with open(input_file, 'rb') as f:
            data = pickle.load(f)

        sanitized = sanitize(data)

        with open(output_file, 'w') as f:
            json.dump(sanitized, f, indent=2)

        print(f"Successfully converted {input_file} to {output_file}")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

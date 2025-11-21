#!/usr/bin/env python3
"""
Robust pickle to JSON converter that handles legacy pandas DataFrames
"""
import pickle
import json
import sys
import io

# Custom unpickler to handle module name changes
class RenameUnpickler(pickle.Unpickler):
    def find_class(self, module, name):
        # Handle renamed pandas modules
        renamed_module = module
        if module.startswith('pandas.core.indexes'):
            # Map old index names to new ones
            renamed_module = module.replace('pandas.core.indexes.numeric', 'pandas.core.indexes.range')
            renamed_module = renamed_module.replace('pandas.core.indexes.base', 'pandas.core.indexes.api')

        try:
            return super().find_class(renamed_module, name)
        except (ImportError, AttributeError):
            # If still fails, try original module
            try:
                return super().find_class(module, name)
            except:
                # Fallback - return a dummy class
                return type(name, (), {})

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

    # Handle pandas DataFrame
    if hasattr(obj, 'to_dict'):
        try:
            return sanitize(obj.to_dict('records'))
        except:
            try:
                return sanitize(obj.to_dict())
            except:
                pass

    # Handle numpy arrays
    if hasattr(obj, 'tolist'):
        try:
            return sanitize(obj.tolist())
        except:
            pass

    # Handle pandas Series
    if hasattr(obj, 'values'):
        try:
            return sanitize(obj.values.tolist())
        except:
            pass

    # Handle objects with __dict__
    if hasattr(obj, '__dict__'):
        try:
            return sanitize(obj.__dict__)
        except:
            pass

    # Fallback to string representation
    try:
        return str(obj)
    except:
        return "<unpicklable object>"

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python3 convert-pkl-robust.py <input.pkl> <output.json>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    try:
        with open(input_file, 'rb') as f:
            unpickler = RenameUnpickler(f)
            data = unpickler.load()

        print(f"Loaded pickle data type: {type(data)}")

        sanitized = sanitize(data)

        with open(output_file, 'w') as f:
            json.dump(sanitized, f, indent=2)

        print(f"Successfully converted {input_file} to {output_file}")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

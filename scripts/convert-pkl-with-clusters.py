#!/usr/bin/env python3
"""
Convert pickle to JSON with proper cluster mapping
"""
import pickle
import json
import sys

def process_country_data(metadata_df, temporal_df):
    """Process country data to create proper cluster mapping"""
    if metadata_df is None or temporal_df is None:
        return None, None

    if len(metadata_df) == 0 or len(temporal_df) == 0:
        return None, None

    # Get unique cluster IDs from Sce column (sorted)
    cluster_ids = sorted(metadata_df['Sce'].unique())
    temporal_indices = list(temporal_df.index)

    # Create cluster mapping: which scenarios belong to which cluster
    # The temporal DataFrame rows map to cluster IDs by order
    clusters = {}
    for i, cluster_id in enumerate(cluster_ids):
        # Get all scenario indices for this cluster
        scenario_indices = metadata_df[metadata_df['Sce'] == cluster_id].index.tolist()
        scenarios_info = []

        for idx in scenario_indices:
            scenarios_info.append({
                'index': int(idx),
                'region': metadata_df.loc[idx, 'Region'],
                'decade': metadata_df.loc[idx, 'Decade'],
                'scale': metadata_df.loc[idx, 'Scale']
            })

        # Get the weight/probability for this cluster from temporal index
        weight = float(temporal_indices[i]) if i < len(temporal_indices) else 0.0

        clusters[str(cluster_id)] = {
            'scenarios': scenarios_info,
            'count': len(scenarios_info),
            'weight': weight
        }

    # Convert temporal data to dict
    temporal_dict = {}
    for col in temporal_df.columns:
        date_str = str(col)
        temporal_dict[date_str] = {}
        for idx in temporal_df.index:
            value = temporal_df.loc[idx, col]
            # Handle both scalar and Series
            if hasattr(value, 'iloc'):
                value = value.iloc[0]
            temporal_dict[date_str][str(idx)] = float(value)

    return clusters, temporal_dict

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python3 convert-pkl-with-clusters.py <input.pkl> <output.json>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    try:
        with open(input_file, 'rb') as f:
            data = pickle.load(f)

        result = {}

        for country, country_data in data.items():
            if not country_data or len(country_data) != 2:
                result[country] = None
                continue

            metadata_df = country_data[0]
            temporal_df = country_data[1]

            clusters, temporal = process_country_data(metadata_df, temporal_df)

            if clusters is None or temporal is None:
                result[country] = None
            else:
                result[country] = {
                    'clusters': clusters,
                    'temporal': temporal
                }

        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)

        print(f"Successfully converted {input_file} to {output_file}")

        # Print some stats
        countries_with_data = sum(1 for v in result.values() if v is not None)
        print(f"Countries with data: {countries_with_data}/{len(result)}")

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

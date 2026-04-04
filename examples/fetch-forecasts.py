#!/usr/bin/env python3
"""
Example: Systematic fetching of PACE forecasting data

This script demonstrates how to:
1. Check for new forecast updates
2. Fetch latest forecasts and historical data
3. Fetch specific archived forecasts
4. Validate data quality
5. Store data for operational use

Usage:
    python examples/fetch-forecasts.py
    python examples/fetch-forecasts.py --period 2025-06
    python examples/fetch-forecasts.py --validate-only
"""

import pandas as pd
import requests
from datetime import datetime
import argparse
import json
from pathlib import Path

BASE_URL = "https://conflictlab.github.io/data/forecasts"


class PACEDataFetcher:
    """Client for fetching PACE forecasting data."""

    def __init__(self, base_url=BASE_URL, cache_dir="data/pace_cache"):
        self.base_url = base_url
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def get_metadata(self, period="latest"):
        """Fetch forecast metadata."""
        url = f"{self.base_url}/{period}/metadata.json"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()

    def check_for_update(self, last_fetch_date=None):
        """
        Check if new forecasts are available.

        Args:
            last_fetch_date: datetime or None - Last time forecasts were fetched

        Returns:
            (bool, datetime) - (has_update, run_date)
        """
        metadata = self.get_metadata("latest")
        run_date = datetime.fromisoformat(metadata['run_date'])

        if last_fetch_date is None:
            return True, run_date

        return run_date > last_fetch_date, run_date

    def fetch_forecasts(self, period="latest", horizon=12, include_intervals=True):
        """
        Fetch forecast data for a specific period.

        Args:
            period: 'latest' or 'YYYY-MM' (e.g., '2025-06')
            horizon: 6 or 12 months ahead
            include_intervals: Include min/max confidence intervals

        Returns:
            dict with keys: metadata, mean, min, max, historical
        """
        base = f"{self.base_url}/{period}"

        print(f"Fetching forecasts from {base}...")

        # Fetch metadata
        metadata = self.get_metadata(period)

        # Fetch forecasts
        mean = pd.read_csv(f"{base}/forecasts_h{horizon}.csv")

        result = {
            'metadata': metadata,
            'mean': mean,
            'period': period,
            'horizon': horizon
        }

        if include_intervals:
            result['min'] = pd.read_csv(f"{base}/forecasts_h{horizon}_min.csv")
            result['max'] = pd.read_csv(f"{base}/forecasts_h{horizon}_max.csv")

        # Fetch historical data
        result['historical'] = pd.read_csv(f"{base}/Hist.csv", parse_dates=[0])

        return result

    def fetch_latest(self, horizon=12, include_intervals=True):
        """Convenience method to fetch latest forecasts."""
        return self.fetch_forecasts("latest", horizon, include_intervals)

    def list_available_periods(self):
        """
        List all available forecast periods.

        Note: This requires fetching the archive directory listing,
        which isn't directly available via the static API.
        For now, we construct based on metadata.
        """
        # This would ideally come from a catalog.json endpoint
        # For now, return a note
        return "Use the website or GitHub repo to see available periods: " \
               "https://github.com/conflictlab/conflictlab.github.io/tree/main/public/data/forecasts/archive"

    def validate_data(self, data):
        """
        Validate fetched data for quality issues.

        Args:
            data: dict returned from fetch_forecasts()

        Returns:
            dict with validation results
        """
        results = {
            'valid': True,
            'warnings': [],
            'errors': []
        }

        metadata = data['metadata']
        mean = data['mean']
        historical = data['historical']

        # Check 1: Metadata consistency
        forecast_start = pd.to_datetime(metadata['forecast_start_date'])
        data_end = pd.to_datetime(metadata['historical_end_date'])

        expected_start = data_end + pd.DateOffset(months=1)
        if forecast_start != expected_start:
            results['errors'].append(
                f"Forecast start {forecast_start} != data_end + 1 month {expected_start}"
            )
            results['valid'] = False

        # Check 2: No trailing all-zero months in historical data
        last_row_sum = historical.iloc[-1, 1:].sum()
        if last_row_sum == 0:
            results['errors'].append(
                f"Last historical month ({historical.iloc[-1, 0]}) has all zeros"
            )
            results['valid'] = False

        # Check 3: Reasonable forecast values for active countries
        # Get last 12 months historical average
        last_12 = historical.iloc[-12:, 1:]
        hist_avg = last_12.mean()

        # Get forecast average
        forecast_avg = mean.iloc[:, 1:].mean()

        # Check for countries with significant history but zero forecast
        for country in hist_avg.index:
            if hist_avg[country] > 100 and forecast_avg.get(country, 0) == 0:
                results['warnings'].append(
                    f"{country}: {hist_avg[country]:.0f} avg historical but 0 forecast"
                )

        # Check 4: Forecast periods match metadata
        expected_periods = data['horizon']
        actual_periods = len(mean)
        if expected_periods != actual_periods:
            results['errors'].append(
                f"Expected {expected_periods} forecast periods, got {actual_periods}"
            )
            results['valid'] = False

        return results

    def save_to_cache(self, data, filename=None):
        """Save fetched data to local cache."""
        if filename is None:
            period = data['metadata']['forecast_start_date']
            horizon = data['horizon']
            filename = f"pace_forecast_{period}_h{horizon}.json"

        filepath = self.cache_dir / filename

        # Convert DataFrames to dict for JSON serialization
        cache_data = {
            'metadata': data['metadata'],
            'mean': data['mean'].to_dict('records'),
            'historical': data['historical'].to_dict('records'),
            'cached_at': datetime.now().isoformat()
        }

        if 'min' in data:
            cache_data['min'] = data['min'].to_dict('records')
        if 'max' in data:
            cache_data['max'] = data['max'].to_dict('records')

        with open(filepath, 'w') as f:
            json.dump(cache_data, f, indent=2)

        print(f"Saved to {filepath}")
        return filepath


def main():
    parser = argparse.ArgumentParser(
        description='Fetch PACE conflict forecasting data'
    )
    parser.add_argument(
        '--period',
        default='latest',
        help='Forecast period: "latest" or YYYY-MM (e.g., 2025-06)'
    )
    parser.add_argument(
        '--horizon',
        type=int,
        default=12,
        choices=[6, 12],
        help='Forecast horizon in months'
    )
    parser.add_argument(
        '--no-intervals',
        action='store_true',
        help='Skip min/max confidence intervals (faster)'
    )
    parser.add_argument(
        '--validate-only',
        action='store_true',
        help='Only validate latest data, don\'t save'
    )
    parser.add_argument(
        '--save',
        action='store_true',
        help='Save fetched data to cache'
    )

    args = parser.parse_args()

    # Initialize fetcher
    fetcher = PACEDataFetcher()

    # Check for updates
    print("Checking for updates...")
    has_update, run_date = fetcher.check_for_update()

    if has_update:
        print(f"✅ New forecasts available from {run_date}")
    else:
        print("ℹ️  No new forecasts since last check")

    # Fetch data
    print(f"\nFetching {args.period} forecasts (h={args.horizon})...")
    data = fetcher.fetch_forecasts(
        period=args.period,
        horizon=args.horizon,
        include_intervals=not args.no_intervals
    )

    # Print summary
    print(f"\n{'='*60}")
    print("FORECAST SUMMARY")
    print(f"{'='*60}")
    print(f"Period: {data['metadata']['forecast_start_date']} to {data['metadata'][f'h{args.horizon}_end_date']}")
    print(f"Data through: {data['metadata']['historical_end_date']}")
    print(f"Countries: {len(data['mean'].columns) - 1}")
    print(f"Historical months: {len(data['historical'])}")
    print(f"Forecast months: {len(data['mean'])}")

    # Validate
    print(f"\n{'='*60}")
    print("DATA VALIDATION")
    print(f"{'='*60}")
    validation = fetcher.validate_data(data)

    if validation['valid']:
        print("✅ All validation checks passed")
    else:
        print("❌ Validation failed:")
        for error in validation['errors']:
            print(f"  - {error}")

    if validation['warnings']:
        print("\n⚠️  Warnings:")
        for warning in validation['warnings'][:5]:
            print(f"  - {warning}")
        if len(validation['warnings']) > 5:
            print(f"  ... and {len(validation['warnings']) - 5} more")

    # Save if requested
    if args.save and not args.validate_only:
        fetcher.save_to_cache(data)

    # Show sample data
    print(f"\n{'='*60}")
    print("SAMPLE: First 3 Countries, First 3 Months")
    print(f"{'='*60}")
    sample = data['mean'].iloc[:3, :4]
    print(sample)

    if 'min' in data and 'max' in data:
        print("\nConfidence Intervals (90%):")
        countries = data['mean'].columns[1:4]
        for country in countries:
            mean_val = data['mean'][country].iloc[0]
            min_val = data['min'][country].iloc[0]
            max_val = data['max'][country].iloc[0]
            print(f"  {country}: {mean_val:.1f} ({min_val:.1f} - {max_val:.1f})")


if __name__ == '__main__':
    main()

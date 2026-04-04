#!/usr/bin/env Rscript
#' Systematic fetching of PACE forecasting data
#'
#' This script demonstrates how to:
#' 1. Check for new forecast updates
#' 2. Fetch latest forecasts and historical data
#' 3. Validate data quality
#' 4. Store data for operational use
#'
#' Usage:
#'   Rscript examples/fetch-forecasts.R
#'   Rscript examples/fetch-forecasts.R --period 2025-06
#'   Rscript examples/fetch-forecasts.R --validate-only

library(httr)
library(jsonlite)
library(dplyr)
library(lubridate)

BASE_URL <- "https://conflictlab.github.io/data/forecasts"

#' Fetch forecast metadata
#'
#' @param period Forecast period: 'latest' or YYYY-MM
#' @return List with metadata
get_metadata <- function(period = "latest") {
  url <- sprintf("%s/%s/metadata.json", BASE_URL, period)
  response <- GET(url)
  stop_for_status(response)
  fromJSON(content(response, "text"))
}

#' Check if new forecasts are available
#'
#' @param last_fetch_date POSIXct or NULL - Last fetch timestamp
#' @return List with has_update (logical) and run_date (POSIXct)
check_for_update <- function(last_fetch_date = NULL) {
  metadata <- get_metadata("latest")
  run_date <- ymd_hms(metadata$run_date)

  has_update <- if (is.null(last_fetch_date)) {
    TRUE
  } else {
    run_date > last_fetch_date
  }

  list(has_update = has_update, run_date = run_date)
}

#' Fetch forecast data
#'
#' @param period 'latest' or 'YYYY-MM'
#' @param horizon 6 or 12 months ahead
#' @param include_intervals Include min/max confidence intervals
#' @return List with metadata, mean, min, max, historical
fetch_forecasts <- function(period = "latest",
                            horizon = 12,
                            include_intervals = TRUE) {
  base <- sprintf("%s/%s", BASE_URL, period)

  cat(sprintf("Fetching forecasts from %s...\n", base))

  # Fetch metadata
  metadata <- get_metadata(period)

  # Fetch forecasts
  mean <- read.csv(sprintf("%s/forecasts_h%d.csv", base, horizon))

  result <- list(
    metadata = metadata,
    mean = mean,
    period = period,
    horizon = horizon
  )

  if (include_intervals) {
    result$min <- read.csv(sprintf("%s/forecasts_h%d_min.csv", base, horizon))
    result$max <- read.csv(sprintf("%s/forecasts_h%d_max.csv", base, horizon))
  }

  # Fetch historical data
  result$historical <- read.csv(sprintf("%s/Hist.csv", base))
  result$historical$date <- as.Date(result$historical$date)

  result
}

#' Validate fetched data for quality issues
#'
#' @param data List returned from fetch_forecasts()
#' @return List with valid (logical), warnings, errors
validate_data <- function(data) {
  results <- list(
    valid = TRUE,
    warnings = c(),
    errors = c()
  )

  metadata <- data$metadata
  mean_df <- data$mean
  hist_df <- data$historical

  # Check 1: Metadata consistency
  forecast_start <- as.Date(paste0(metadata$forecast_start_date, "-01"))
  data_end <- as.Date(paste0(metadata$historical_end_date, "-01"))

  expected_start <- data_end %m+% months(1)

  if (forecast_start != expected_start) {
    msg <- sprintf(
      "Forecast start %s != data_end + 1 month %s",
      forecast_start, expected_start
    )
    results$errors <- c(results$errors, msg)
    results$valid <- FALSE
  }

  # Check 2: No trailing all-zero months
  last_row_sum <- sum(hist_df[nrow(hist_df), -1], na.rm = TRUE)

  if (last_row_sum == 0) {
    msg <- sprintf(
      "Last historical month (%s) has all zeros",
      hist_df$date[nrow(hist_df)]
    )
    results$errors <- c(results$errors, msg)
    results$valid <- FALSE
  }

  # Check 3: Countries with significant history but zero forecast
  last_12 <- tail(hist_df, 12)
  hist_avg <- colMeans(last_12[, -1], na.rm = TRUE)
  forecast_avg <- colMeans(mean_df[, -1], na.rm = TRUE)

  for (country in names(hist_avg)) {
    if (!is.na(hist_avg[country]) && hist_avg[country] > 100) {
      if (is.na(forecast_avg[country]) || forecast_avg[country] == 0) {
        msg <- sprintf(
          "%s: %.0f avg historical but 0 forecast",
          country, hist_avg[country]
        )
        results$warnings <- c(results$warnings, msg)
      }
    }
  }

  # Check 4: Forecast periods match metadata
  expected_periods <- data$horizon
  actual_periods <- nrow(mean_df)

  if (expected_periods != actual_periods) {
    msg <- sprintf(
      "Expected %d forecast periods, got %d",
      expected_periods, actual_periods
    )
    results$errors <- c(results$errors, msg)
    results$valid <- FALSE
  }

  results
}

#' Print forecast summary
#'
#' @param data List returned from fetch_forecasts()
print_summary <- function(data) {
  cat(rep("=", 60), "\n", sep = "")
  cat("FORECAST SUMMARY\n")
  cat(rep("=", 60), "\n", sep = "")

  metadata <- data$metadata
  h <- data$horizon

  cat(sprintf("Period: %s to %s\n",
              metadata$forecast_start_date,
              metadata[[sprintf("h%d_end_date", h)]]))
  cat(sprintf("Data through: %s\n", metadata$historical_end_date))
  cat(sprintf("Countries: %d\n", ncol(data$mean) - 1))
  cat(sprintf("Historical months: %d\n", nrow(data$historical)))
  cat(sprintf("Forecast months: %d\n", nrow(data$mean)))
}

#' Print validation results
#'
#' @param validation List returned from validate_data()
print_validation <- function(validation) {
  cat("\n", rep("=", 60), "\n", sep = "")
  cat("DATA VALIDATION\n")
  cat(rep("=", 60), "\n", sep = "")

  if (validation$valid) {
    cat("✅ All validation checks passed\n")
  } else {
    cat("❌ Validation failed:\n")
    for (error in validation$errors) {
      cat(sprintf("  - %s\n", error))
    }
  }

  if (length(validation$warnings) > 0) {
    cat("\n⚠️  Warnings:\n")
    for (warning in head(validation$warnings, 5)) {
      cat(sprintf("  - %s\n", warning))
    }
    if (length(validation$warnings) > 5) {
      cat(sprintf("  ... and %d more\n", length(validation$warnings) - 5))
    }
  }
}

#' Print sample data
#'
#' @param data List returned from fetch_forecasts()
print_sample <- function(data) {
  cat("\n", rep("=", 60), "\n", sep = "")
  cat("SAMPLE: First 3 Countries, First 3 Months\n")
  cat(rep("=", 60), "\n", sep = "")

  sample <- data$mean[1:3, 1:4]
  print(sample)

  if (!is.null(data$min) && !is.null(data$max)) {
    cat("\nConfidence Intervals (90%):\n")
    countries <- names(data$mean)[2:4]

    for (country in countries) {
      mean_val <- data$mean[[country]][1]
      min_val <- data$min[[country]][1]
      max_val <- data$max[[country]][1]

      cat(sprintf("  %s: %.1f (%.1f - %.1f)\n",
                  country, mean_val, min_val, max_val))
    }
  }
}

# Main execution
main <- function() {
  # Parse command line arguments
  args <- commandArgs(trailingOnly = TRUE)

  period <- "latest"
  horizon <- 12
  validate_only <- FALSE

  if (length(args) > 0) {
    for (i in seq_along(args)) {
      if (args[i] == "--period" && i < length(args)) {
        period <- args[i + 1]
      } else if (args[i] == "--horizon" && i < length(args)) {
        horizon <- as.integer(args[i + 1])
      } else if (args[i] == "--validate-only") {
        validate_only <- TRUE
      }
    }
  }

  # Check for updates
  cat("Checking for updates...\n")
  update_check <- check_for_update()

  if (update_check$has_update) {
    cat(sprintf("✅ New forecasts available from %s\n", update_check$run_date))
  } else {
    cat("ℹ️  No new forecasts since last check\n")
  }

  # Fetch data
  cat(sprintf("\nFetching %s forecasts (h=%d)...\n", period, horizon))
  data <- fetch_forecasts(period = period, horizon = horizon)

  # Print summary
  print_summary(data)

  # Validate
  validation <- validate_data(data)
  print_validation(validation)

  # Print sample
  if (!validate_only) {
    print_sample(data)
  }

  invisible(data)
}

# Run if called as script
if (sys.nframe() == 0L) {
  main()
}

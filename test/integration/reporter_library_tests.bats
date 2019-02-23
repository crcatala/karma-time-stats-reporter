RUN_EXAMPLE_KARMA_TESTS_COMMAND="npm run test:lib:integration:examples"

@test "Reporter -> Test Time Stats -> Is Enabled By Default" {
  result="$(SPEC=**/quick.spec.js $RUN_EXAMPLE_KARMA_TESTS_COMMAND)"
  
  echo $result | grep "Test Time Stats"
}

@test "Reporter -> Test Time Stats -> Can be disabled" {
  result="$(TIME_STATS_REPORTER_REPORT_TIME_STATS=false SPEC=**/quick.spec.js $RUN_EXAMPLE_KARMA_TESTS_COMMAND | grep "Test Time Stats" | wc -l | tr -d ' ')"

  [[ "$result" = "0" ]]
}

@test "Reporter -> Test Time Stats -> Prints number of tests slower than threshold" {
  EXPECT_SLOW_TEST_COUNT=1
  REGEX="^\[>[0-9]+ms\]\s+$EXPECT_SLOW_TEST_COUNT"
  result="$(TIME_STATS_REPORTER_LONGEST_TESTS_COUNT=1 SPEC=**/single_slow_example.spec.js $RUN_EXAMPLE_KARMA_TESTS_COMMAND | grep -E $REGEX | wc -l | tr -d ' ')"

  [[ "$result" = "1" ]]
}

@test "Reporter -> Test Time Stats -> When slow threshold is modified -> And no tests are slower than threshold-> Prints zero count" {
  SPEC_FILE=**/single_slow_example.spec.js
  EXPECTED_SLOW_TEST_COUNT=0
  SLOW_THRESHOLD=10000
  REGEX="^\[>[0-9]+ms\]\s+[$EXPECTED_SLOW_TEST_COUNT]"

  result="$(TIME_STATS_REPORTER_SLOW_THRESHOLD=$SLOW_THRESHOLD SPEC=$SPEC_FILE $RUN_EXAMPLE_KARMA_TESTS_COMMAND | grep -E $REGEX | wc -l | tr -d ' ')"

  [[ "$result" = "1" ]]
}

@test "Reporter -> Test Time Stats -> When slow threshold is modified -> And a test is slower than threshold-> Prints a positive count" {
  SPEC_FILE=**/single_slow_example.spec.js
  EXPECTED_SLOW_TEST_COUNT=1
  SLOW_THRESHOLD=100
  REGEX="^\[>[0-9]+ms\]\s+[$EXPECTED_SLOW_TEST_COUNT]"

  result="$(TIME_STATS_REPORTER_SLOW_THRESHOLD=$SLOW_THRESHOLD SPEC=$SPEC_FILE $RUN_EXAMPLE_KARMA_TESTS_COMMAND | grep -E $REGEX | wc -l | tr -d ' ')"

  [[ "$result" = "1" ]]
}

@test "Reporter -> Test Time Stats -> Normalizes Slow Threshold to evenly divisible value" {
  expected_text=">600ms"
  result="$(TIME_STATS_REPORTER_SLOW_THRESHOLD=501 SPEC=**/quick.spec.js $RUN_EXAMPLE_KARMA_TESTS_COMMAND | grep "$expected_text" | wc -l | tr -d ' ')"

  [[ "$result" = "1" ]]
}

@test "Reporter -> Slowest Tests -> Is Enabled By Default" {
  result="$(SPEC=**/quick.spec.js $RUN_EXAMPLE_KARMA_TESTS_COMMAND)"
  
  echo $result | grep "Slowest Tests"
}

@test "Reporter -> Slowest Tests -> Can be disabled" {
  result="$(TIME_STATS_REPORTER_REPORT_SLOWEST_TESTS=false SPEC=**/quick.spec.js $RUN_EXAMPLE_KARMA_TESTS_COMMAND | grep "Slowest Tests" | wc -l | tr -d ' ')"

  [[ "$result" = "0" ]]
}

@test "Reporter -> Slowest Tests -> Prints top 5 slowest tests by default" {
  REGEX="^[0-9]+ms"
  result="$(SPEC=**/ten_progressively_slow.spec.js $RUN_EXAMPLE_KARMA_TESTS_COMMAND | grep -E $REGEX | wc -l | tr -d ' ')"

  [[ "$result" = "5" ]]
}

@test "Reporter -> Slowest Tests -> Supports option for number of top slowest tests to report" {
  REGEX="^[0-9]+ms"
  result="$(TIME_STATS_REPORTER_LONGEST_TESTS_COUNT=1 SPEC=**/ten_progressively_slow.spec.js $RUN_EXAMPLE_KARMA_TESTS_COMMAND | grep -E $REGEX | wc -l | tr -d ' ')"

  [[ "$result" = "1" ]]
}

const chalk = require("chalk");

function printInfo(val, { indent = 0 } = {}) {
  const indentString = Array(indent).join(" ");
  console.log(`${indentString}${val}`);
}

function printWarning(val, { indent = 0 } = {}) {
  printInfo(chalk.yellow(val), { indent });
}

module.exports.printInfo = printInfo;
module.exports.printWarning = printWarning;

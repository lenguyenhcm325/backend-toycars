function parsePriceToFloat(inputString) {
  const stringWithoutFirstLetter = inputString.slice(1);
  const parsedNumber = parseFloat(stringWithoutFirstLetter);
  const roundedNumber = Math.round(parsedNumber * 100) / 100;
  return roundedNumber;
}

// Example usage:
const inputString = "A23.45678";
const result = parsePriceToFloat(inputString);
if (!isNaN(result)) {
  console.log(`Parsed number: ${result}`);
} else {
  console.log("Invalid input string.");
}

module.exports = parsePriceToFloat;

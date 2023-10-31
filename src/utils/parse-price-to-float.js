function parsePriceToFloat(inputString) {
  const stringWithoutFirstLetter = inputString.slice(1);
  const parsedNumber = parseFloat(stringWithoutFirstLetter);
  const roundedNumber = Math.round(parsedNumber * 100) / 100;
  return roundedNumber;
}

module.exports = parsePriceToFloat;

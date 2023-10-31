const createOrderConfirmationHTML = (productsBought, totalPrice) => {
  let lineItemsHTML = "";
  for (const productBought of productsBought) {
    const { modelBrand, quantity, price } = productBought;
    lineItemsHTML =
      lineItemsHTML +
      `
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${modelBrand}</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd; text-align: center;">${quantity}</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd; text-align: right;">€${price}</td>
        </tr>        
`;
  }
  return `

    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation Email</title>
    </head>
    <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
            <h2 style="text-align: center; color: #444;">Order Confirmation</h2>
            <p>Thank you for your order! Here are the details:</p>
            
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="border-bottom: 2px solid #ddd; padding: 10px 0; text-align: left;">Product Name</th>
                        <th style="border-bottom: 2px solid #ddd; padding: 10px 0; text-align: center;">Quantity</th>
                        <th style="border-bottom: 2px solid #ddd; padding: 10px 0; text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${lineItemsHTML}
                </tbody>
            </table>
            
            <p style="text-align: right; margin-top: 20px; font-weight: bold;">Total: <span style="color: #007BFF;">€${totalPrice}</span></p>
            <p>If you have any questions, please don't hesitate to contact us. Thank you for shopping with us!</p>
        </div>
    </body>
    </html>
    `;
};

module.exports = { createOrderConfirmationHTML };

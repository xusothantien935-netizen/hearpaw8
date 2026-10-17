HearPaw — requested chatbot, Milo avatar, brand and checkout updates

Changes in this package:
- Brand wordmark in header and footer displays HearPaw with capital H and P.
- Chat widget uses the existing HearPaw paw logo, topic buttons, and Vietnamese keyword-based answers for collar sizing, My Pet, products/prices, personalization, checkout, and support.
- Milo's dashboard switcher and pet profile use assets/milo.jpg (the supplied Golden Retriever photo).
- Cart contents are saved to localStorage so they survive navigating to login/register and returning to checkout.
- Successful demo registration now follows the stored return URL like demo login.
- Logged-in customers can reveal demo payment choices: MoMo, bank QR, and cash on delivery.

Important:
- This is still a front-end demo. The MoMo and QR choices do not initiate real transactions; the QR is an illustrative placeholder.
- Demo login account remains demo@hearpaw.vn / 123456.
- Upload/replace index.html, styles.css, script.js, login.html and assets in the repository root.

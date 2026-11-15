/* EC Marketing Corporation - Optional EmailJS config (OFF by default)
 *
 * To enable real email notifications after an order is saved:
 * 1. Create a free EmailJS account at https://www.emailjs.com/
 * 2. Add an Email Service (e.g. Gmail) and note the Service ID.
 * 3. Create an Email Template and include variables used by this site:
 *      {{to_email}}        - recipient (info@calbayogec.com)
 *      {{order_ref}}       - order reference (ECM-YYYYMMDD-####)
 *      {{customer_name}}   - customer name
 *      {{customer_mobile}} - mobile number
 *      {{customer_email}}  - customer email (optional)
 *      {{customer_type}}   - customer type
 *      {{company}}         - company name (if any)
 *      {{delivery_method}} - Pickup or Delivery
 *      {{address}}         - delivery address
 *      {{payment}}         - payment preference
 *      {{items}}           - items and quantities (text)
 *      {{subtotal}}        - subtotal/price note
 *      {{notes}}           - customer notes
 *      {{order_message}}   - full formatted order message
 *      {{timestamp}}       - order timestamp
 * 4. Copy your Public Key from EmailJS Account settings.
 * 5. Paste the three values below. When all three are non-empty, the site will
 *    load the EmailJS browser script (pinned CDN) and attempt to send a
 *    notification to info@calbayogec.com after the order is saved.
 *    If sending fails or you are offline, the order is still saved and the
 *    customer sees: "Order saved. Email notification could not be sent."
 * 6. Leave all values empty ("") to keep EmailJS OFF (no external script, no
 *    network requests). This is the default.
 */
var EMAILJS = {
  serviceId: "",
  templateId: "",
  publicKey: ""
};

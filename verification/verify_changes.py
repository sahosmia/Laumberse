import os
from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Set viewport size to handle portal overlays
    page.set_viewport_size({"width": 1280, "height": 1000})

    # Capture browser console logs
    page.on("console", lambda msg: print(f"BROWSER CONSOLE: [{msg.type}] {msg.text}"))
    page.on("pageerror", lambda err: print(f"BROWSER ERROR: {err.message}"))

    print("Navigating to login page...")
    page.goto("http://localhost:8000/login")
    page.wait_for_timeout(1000)

    print("Logging in...")
    page.fill("input[type='email']", "admin@example.com")
    page.fill("input[type='password']", "password")
    page.click("button[type='submit']")
    page.wait_for_timeout(2000)

    print("Successfully logged in, navigating to Create Invoice...")
    page.goto("http://localhost:8000/invoices/create")
    page.wait_for_timeout(1500)

    # Click "New Client" checkbox
    print("Selecting New Client...")
    page.click("button#create_new_client")
    page.wait_for_timeout(1000)

    # Change type to Corporate
    print("Selecting type 'Corporate' for new client...")
    page.select_option("select[id='new_client_type']", "Corporate")
    page.wait_for_timeout(1000)

    # Let's search and add a product
    print("Searching for product...")
    page.fill("input[placeholder='Search product...']", "Shirt")
    page.wait_for_timeout(1000)

    # Click the first product in the dropdown
    print("Adding product...")
    page.locator("button:has-text('Shirt')").first.click()
    page.wait_for_timeout(1000)

    # Let's type a custom quantity
    print("Setting custom quantity...")
    qty_input = page.locator("input[type='number']").first
    qty_input.fill("")
    page.wait_for_timeout(500)
    qty_input.fill("5")
    page.wait_for_timeout(1000)

    # Click the delete button
    print("Clicking delete/remove icon...")
    page.locator("table tbody tr").first.locator("td").last.locator("button").click()
    page.wait_for_timeout(1500)

    # Take screenshot of the popup
    popup_screenshot_path = "verification/screenshots/popup_visible.png"
    page.screenshot(path=popup_screenshot_path)
    print(f"Popup screenshot taken and saved to {popup_screenshot_path}")

    # Verify that the popup modal is visible, then cancel/close it
    print("Checking if popup is shown and cancelling...")
    page.locator("button:has-text('Cancel')").last.click()
    page.wait_for_timeout(1000)

    # Let's add details for the new client and save
    print("Filling new client name & phone...")
    page.fill("input[id='new_client_name']", "Test Corporate Client")
    page.fill("input[id='new_client_phone']", "01712345678")
    page.wait_for_timeout(500)

    # Submit form
    print("Saving invoice...")
    page.locator("button[type='submit']").click()
    page.wait_for_timeout(3000)

    print("Navigating to Expenses page...")
    page.goto("http://localhost:8000/expenses")
    page.wait_for_timeout(2000)

    # Take screenshot at the expenses page showing EXP-XXXX
    screenshot_path = "verification/screenshots/verification.png"
    page.screenshot(path=screenshot_path)
    print(f"Screenshot taken and saved to {screenshot_path}")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    os.makedirs("verification/videos", exist_ok=True)
    os.makedirs("verification/screenshots", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()

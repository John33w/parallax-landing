from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto('https://rinawrites.vercel.app', wait_until='domcontentloaded')
    page.wait_for_timeout(3000)
    page.screenshot(path='screenshot.png')
    browser.close()

with sync_playwright() as playwright:
    run(playwright)

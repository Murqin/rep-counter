import asyncio
from playwright.async_api import async_playwright
import os
import time

async def take_screenshots():
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=True)
        
        # Mobile device emulation (iPhone 14 Pro Max size-ish)
        device = p.devices['iPhone 14 Pro Max']
        context = await browser.new_context(**device)
        page = await context.new_page()
        
        # URL of the local dev server (assuming it's running)
        url = "http://localhost:5173"
        
        print(f"Connecting to {url}...")
        try:
            await page.goto(url)
        except Exception as e:
            print(f"Error: Could not connect to {url}. Is the dev server running? (npm run dev)")
            await browser.close()
            return

        # Ensure directory exists
        if not os.path.exists('output'):
            os.makedirs('output')

        # 1. Counter Screen
        print("Taking Counter screen...")
        await page.wait_for_timeout(1000) # Wait for animations
        await page.screenshot(path='output/1_counter.png')

        # 2. Settings Menu
        print("Taking Settings screen...")
        await page.click('[aria-label="Open Settings"]')
        await page.wait_for_timeout(1000)
        await page.screenshot(path='output/2_settings.png')
        await page.click('[aria-label="Close"]') # Close it

        # 3. Timer Screen (Mocking a rest state)
        print("Taking Timer screen...")
        await page.click('text="FINISH ROUND"')
        await page.wait_for_timeout(1000)
        await page.screenshot(path='output/3_timer.png')

        # 4. Success Screen
        print("Taking Success screen...")
        # Skip break to get back to counter
        await page.click('text="SKIP BREAK"')
        # We would need to finish all rounds. Let's just mock the state via JS for speed.
        await page.evaluate("""
            const store = JSON.parse(localStorage.getItem('rep-session'));
            store.currentRound = store.totalRounds + 1;
            localStorage.setItem('rep-session', JSON.stringify(store));
            window.location.reload();
        """)
        await page.wait_for_timeout(1000)
        await page.screenshot(path='output/4_success.png')

        print("All screenshots taken successfully in 'screenshots_tool/output/'")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(take_screenshots())

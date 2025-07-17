from binance.client import Client
from binance.enums import *
import time

# === ✅ Step 1: Testnet API Keys ===
api_key = '1TCcvGqRsgpADNfv655uVce0OO1qZqepE7E094A4F9Bm86I3s3XM3EQcztcJ2ZvZ'
api_secret = 'CE074PQARZdCXWIWVl6vwiu7baV9E1nryVpygiQRsFDe11L9N7vS2Xyv3vlrTJlD'

# === ✅ Step 2: Connect to Binance Testnet ===
client = Client(api_key, api_secret)
client.API_URL = 'https://testnet.binance.vision/api'

# === ✅ Step 3: Grid Bot Configuration ===
symbol = 'BTCUSDT'
grid_levels = 5  # Number of grid lines
grid_lower_price = 60000  # Lowest price in grid
grid_upper_price = 70000  # Highest price in grid
order_quantity = 0.001  # Quantity to trade each level

active_orders = {}

# === ✅ Step 4: Generate Grid Levels ===
grid_step = (grid_upper_price - grid_lower_price) / (grid_levels - 1)
grid_prices = [round(grid_lower_price + i * grid_step, 2) for i in range(grid_levels)]
print(f"\n📊 Grid levels: {grid_prices}\n")

# === ✅ Step 5: Place Buy Orders at Grid Levels ===
for price in grid_prices:
    try:
        order = client.order_limit_buy(
            symbol=symbol,
            quantity=order_quantity,
            price=str(price)
        )
        active_orders[order['orderId']] = {
            'type': 'buy',
            'price': price
        }
        print(f"✅ Buy order placed at ${price}")
        time.sleep(1)
    except Exception as e:
        print(f"❌ Error placing buy order at {price}: {e}")

# === ✅ Step 6: Monitor Fills & Place Sell Orders ===
print("\n🚀 Monitoring orders...\n")

try:
    while True:
        for order_id in list(active_orders.keys()):
            order_info = client.get_order(symbol=symbol, orderId=order_id)

            if order_info['status'] == 'FILLED' and active_orders[order_id]['type'] == 'buy':
                buy_price = float(order_info['price'])
                sell_price = round(buy_price * 1.01, 2)  # 1% profit target

                try:
                    sell_order = client.order_limit_sell(
                        symbol=symbol,
                        quantity=order_quantity,
                        price=str(sell_price)
                    )
                    print(f"💰 Buy filled at ${buy_price} → Sell order placed at ${sell_price}")
                    active_orders[sell_order['orderId']] = {
                        'type': 'sell',
                        'price': sell_price
                    }
                    del active_orders[order_id]
                except Exception as e:
                    print(f"❌ Error placing sell order: {e}")

        time.sleep(10)

except KeyboardInterrupt:
    print("🛑 Bot stopped manually.")
